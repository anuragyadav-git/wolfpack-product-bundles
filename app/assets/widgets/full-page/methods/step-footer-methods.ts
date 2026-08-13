import { BUNDLE_WIDGET } from '../../shared/constants.js';
import { CurrencyManager } from '../../shared/currency-manager.js';
import { PricingCalculator } from '../../shared/pricing-calculator.js';
import { ToastManager } from '../../shared/toast-manager.js';
import {
  buildCartLineDisplayProperties as buildSharedCartLineDisplayProperties,
  buildCartLineSourceProperties as buildSharedCartLineSourceProperties,
} from '../../shared/engine/cart-lines.js';
import { shouldDisplayClassicFixedBundleRawTotal } from '../shared/summary-pricing-display.js';
import { preflightVariantOnStorefront } from '../../shared/variant-preflight.js';

function shouldIncludeBundleQuantityCartProperties(context) {
  const pricing = context?.selectedBundle?.pricing || {};
  const method = String(pricing.method || '').toLowerCase();
  const bundleQuantityOptions = pricing.displayOptions?.bundleQuantityOptions;
  return !(method === 'buy_x_get_y' && bundleQuantityOptions?.enabled === false);
}

function extractNumericFullPageId(value, extractId) {
  if (value === null || value === undefined || value === '') return '';
  if (typeof extractId === 'function') return extractId(value);
  const raw = String(value || '');
  const gidMatch = raw.match(/gid:\/\/shopify\/\w+\/(\d+)/);
  if (gidMatch) return gidMatch[1];
  return raw.includes('/') ? raw.split('/').pop() : raw;
}

function resolveCartVariantId(product, selectionId, extractId) {
  const candidateVariantFromSelection = (() => {
    if (!product) return '';
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const selected = String(selectionId || '');
    if (!selected) return '';

    const matchingVariant = variants.find((candidate) => {
      const candidateId = extractNumericFullPageId(
        candidate?.selectionId || candidate?.variantId || candidate?.id,
        extractId
      );
      return String(candidateId || '') === String(selected);
    });

    if (!matchingVariant) return '';
    return extractNumericFullPageId(
      matchingVariant.variantId || matchingVariant.selectionId || matchingVariant.id,
      extractId
    );
  })();

  if (candidateVariantFromSelection) {
    return candidateVariantFromSelection;
  }

  return extractNumericFullPageId(
    product?.variantId || product?.selectionId || product?.id,
    extractId,
  );
}

function mergeDuplicateCartLines(lines = []) {
  const grouped = new Map();

  lines.forEach((line) => {
    const variantId = String(line?.id || '').trim();
    if (!variantId) {
      grouped.set(Symbol(), line);
      return;
    }

    const properties = line.properties || {};
    const mergeKey = `${variantId}`;
    const existing = grouped.get(mergeKey);

    if (!existing) {
      grouped.set(mergeKey, line);
      return;
    }

    const quantity = Number(existing.quantity || 0) + Number(line.quantity || 0);
    existing.quantity = quantity;
    const existingProperties = existing.properties || {};
    const incomingProperties = properties || {};
    const hasExistingAddon = existingProperties._addon_product === 'true'
      || (existingProperties._bundle_step_type === 'addon' || String(existingProperties._bundle_step_type || '').startsWith('addon:'));
    const hasIncomingAddon = incomingProperties._addon_product === 'true'
      || (incomingProperties._bundle_step_type === 'addon' || String(incomingProperties._bundle_step_type || '').startsWith('addon:'));
    const hasExistingFreeGift = existingProperties._bundle_step_type === 'free_gift';
    const hasIncomingFreeGift = incomingProperties._bundle_step_type === 'free_gift';
    if (hasIncomingAddon || hasExistingAddon) {
      existing.properties = { ...existingProperties, ...incomingProperties };
      existing.properties._bundle_step_type = hasIncomingAddon
        ? (incomingProperties._bundle_step_type || existingProperties._bundle_step_type)
        : existingProperties._bundle_step_type;
    } else if (hasIncomingFreeGift && !hasExistingFreeGift) {
      existing.properties = { ...existingProperties, ...incomingProperties };
      existing.properties._bundle_step_type = 'free_gift';
    }
    if (existing.properties && Object.prototype.hasOwnProperty.call(existing.properties, '_wolfpackProductBundle:prodQty')) {
      existing.properties['_wolfpackProductBundle:prodQty'] = String(quantity);
    }
  });

  return Array.from(grouped.values());
}

export const fullPageStepFooterMethods: Record<string, any> & ThisType<any> = {
  isSelectedAddonCartLine(step) {
    if (step?.isFreeGift !== true) return false;
    const addonEval = typeof this.getAddonTierEvaluation === 'function'
      ? this.getAddonTierEvaluation(step)
      : {};
    if (addonEval?.tier && addonEval?.isEligible !== false) return true;
    if (step?.addonDisplayFree === true) return false;
    if (typeof this.getAddonLineDiscount !== 'function') return true;
    return Boolean(this.getAddonLineDiscount(step));
  },

  buildCartLineSourceProperties(selectedLines) {
    const parentSelectedLines = selectedLines.filter((line) => {
      return !fullPageStepFooterMethods.isSelectedAddonCartLine.call(this, line?.step);
    });
    const totalPrice = parentSelectedLines.reduce((sum, line) => {
      const quantity = Number(line?.quantity || 0);
      const price = Number(line?.product?.price || 0);
      return sum + (price * quantity);
    }, 0);
    const totalQuantity = parentSelectedLines.reduce(
      (sum, line) => sum + Number(line?.quantity || 0),
      0
    );
    const unitPrices = [];
    parentSelectedLines.forEach((line) => {
      const quantity = Number(line?.quantity || 0);
      const price = Number(line?.product?.price || 0);
      for (let i = 0; i < quantity; i += 1) unitPrices.push(price);
    });
    const discountInfo = PricingCalculator.calculateDiscount(
      this.selectedBundle,
      totalPrice,
      totalQuantity,
      unitPrices
    );
    const currencyInfo = CurrencyManager.getCurrencyInfo();
    const discountAmount = Math.max(0, Number(discountInfo.discountAmount || 0));
    const discountPercentage = Number(discountInfo.discountPercentage || 0)
      || (totalPrice > 0 ? (discountAmount / totalPrice) * 100 : 0);
    const useDisplayOnlyFixedPrice = shouldDisplayClassicFixedBundleRawTotal(this, discountInfo);

    const sourceProperties = buildSharedCartLineSourceProperties({
      selectedLines: parentSelectedLines,
      retailPrice: useDisplayOnlyFixedPrice
        ? ''
        : CurrencyManager.convertAndFormat(totalPrice, currencyInfo),
      discountAmount: !useDisplayOnlyFixedPrice && discountAmount > 0
        ? CurrencyManager.convertAndFormat(discountAmount, currencyInfo)
        : '',
      discountPercentage,
      includeBox: shouldIncludeBundleQuantityCartProperties(this),
    });

    return sourceProperties;
  },

  buildCartLineDisplayProperties(displayProperties) {
    return buildSharedCartLineDisplayProperties(displayProperties, this.getCartLineLabels());
  },

  // Add bundle to cart
  async addBundleToCart(clickedButton = null) {
  if (this._isWidgetActionBusy) return;
  const actionButton = clickedButton || this.container?.querySelector('.footer-btn-next');
  this._setWidgetBusy(true, actionButton);
  this.showLoadingOverlay();
  await Promise.resolve();

  try {
    // Final validation: all paid steps must be satisfied.
    // Free gift and default steps are non-blocking and are intentionally skipped here —
    // the customer may choose not to select a free gift, and default items are pre-seeded.
    const allStepsValid = this.areBundleConditionsMet();
    if (!allStepsValid) {
      ToastManager.show('Please complete all bundle steps before adding to cart.');
      return;
    }
    // Build cart items from selected products
    let items = [];

    // Generate unique bundle instance ID for this add-to-cart action
    // This allows cart transform to group components and prevents Shopify from
    // consolidating separate bundle instances added at different times
    const bundleName = this.selectedBundle.name || 'Bundle';
    const sessionKey = this.generateBundleSessionKey();
    const offerId = this.resolveFullPageOfferId();
    const baseOfferId = `${offerId}_${sessionKey}`;
    const selectedLines = [];
    const variantPreflightCache = new Map();
    const unavailableLines = [];
    let itemNumber = 0;
    const hasAddonStepConfigured = (this.selectedBundle?.steps || []).some((candidateStep) => {
      return fullPageStepFooterMethods.isSelectedAddonCartLine.call(this, candidateStep);
    });

    let hasSelectedAddonLine = false;


    for (let stepIndex = 0; stepIndex < this.selectedBundle.steps.length; stepIndex += 1) {
      const step = this.selectedBundle.steps[stepIndex];
      const stepSelections = this.selectedProducts[stepIndex] || {};
      const productsInStep = this.expandProductsByVariant(this.stepProductData[stepIndex] || []);

      for (const [variantId, quantity] of Object.entries(stepSelections)) {
        if (quantity <= 0) continue;
        const requestedQuantity = Number(quantity || 0);
        const resolvedSelectionId = extractNumericFullPageId(
          variantId,
          typeof this.extractId === 'function' ? this.extractId : null,
        );
        const product = productsInStep.find((candidate) => {
          const candidateSelectionId = extractNumericFullPageId(
            candidate?.selectionId || candidate?.variantId || candidate?.id,
            typeof this.extractId === 'function' ? this.extractId : null,
          );
          return String(candidateSelectionId || '') === String(resolvedSelectionId || '');
        });
        if (!product) {
          unavailableLines.push(`runtime-preflight blocked: unable to resolve selected product variant for step ${stepIndex + 1}.`);
          continue;
        }
        const numericVariantId = extractNumericFullPageId(
          resolveCartVariantId(product, resolvedSelectionId, typeof this.extractId === 'function' ? this.extractId : null),
          typeof this.extractId === 'function' ? this.extractId : null,
        );
        if (!numericVariantId || !/^\d+$/.test(numericVariantId)) {
          unavailableLines.push(`runtime-preflight blocked: invalid variant id ${String(product?.title || variantId || resolvedSelectionId)} in step ${stepIndex + 1}.`);
          continue;
        }

        let preflightResult = variantPreflightCache.get(numericVariantId);
        if (!preflightResult) {
          preflightResult = await preflightVariantOnStorefront(
            numericVariantId,
            typeof fetch === 'function' ? fetch : null,
          );
        }
        variantPreflightCache.set(numericVariantId, preflightResult);
        if (!preflightResult.ok) {
          unavailableLines.push(
            `runtime-preflight blocked: step ${stepIndex + 1} product ${productsInStep.indexOf(product) + 1} variant ${numericVariantId} (status ${preflightResult.status})`,
          );
          continue;
        }

        const availability = typeof this.getVariantAvailable === 'function'
          ? this.getVariantAvailable(stepIndex, resolvedSelectionId)
          : { available: null, outOfStock: false, acceptsBackorder: false };
        if (availability?.outOfStock) {
          unavailableLines.push(`${product?.title || variantId} is out of stock.`);
          continue;
        }
        if (
          typeof availability?.available === 'number'
          && requestedQuantity > availability.available
        ) {
          unavailableLines.push(
            `${product?.title || variantId} only has ${availability.available} in stock.`,
          );
          continue;
        }

        itemNumber += 1;
        const properties = {
          '_bundleName': bundleName,
          '_wolfpackProductBundle:prodQty': String(quantity),
          '_wolfpackProductBundle:OfferId': `${offerId}_${sessionKey}_${itemNumber}`,
        };
        if (shouldIncludeBundleQuantityCartProperties(this)) {
          properties.Box = String(itemNumber);
        }
        const addonEval = this.getAddonTierEvaluation?.(step) || {};
        const addonDiscount = typeof this.getAddonLineDiscount === 'function'
          ? this.getAddonLineDiscount(step)
          : null;
        const isAddonCartLine = fullPageStepFooterMethods.isSelectedAddonCartLine.call(this, step);
        if (isAddonCartLine && addonEval?.tier) {
          hasSelectedAddonLine = true;
          properties.Box = '1';
          properties._addon_product = 'true';
          properties._addon_offer_id = baseOfferId;
          properties._boxProduct = 'addonProduct';
          if (addonEval?.tier?.tierId) {
            properties._addonTierId = String(addonEval.tier.tierId);
          }
          properties._uniqueWpbItemKey = `${numericVariantId}_pageId:addonProduct`;
          properties._bundle_step_type = addonDiscount
            ? `addon:${addonDiscount.type}:${addonDiscount.value}`
            : 'addon';
        } else if (step?.isFreeGift && step?.addonDisplayFree === true) {
          properties._bundle_step_type = 'free_gift';
        }
        if (step?.isDefault) properties._bundle_step_type = 'default';

        const cartItem = {
          id: numericVariantId,
          quantity: quantity,
          properties,
          _runtimeProductId: [product?.productId, product?.graphqlId, product?.id]
            .find(value => String(value || '').includes('/Product/')) || null,
        };
        items.push(cartItem);
        selectedLines.push({ product, quantity, step });
      }
    }

    const itemsForRuntimeToken = items;

    if (unavailableLines.length > 0) {
      ToastManager.show(unavailableLines[0]);
      return;
    }

    if (items.length === 0) {
      ToastManager.show('Please select products before adding to cart');
      return;
    }

    const sourceProperties = this.buildCartLineSourceProperties(selectedLines);
    items.forEach(item => {
      Object.assign(item.properties, sourceProperties);
      if (hasSelectedAddonLine && hasAddonStepConfigured) {
        item.properties._addon_offer_id = item.properties._addon_offer_id || baseOfferId;
      }
    });

    try {
      const requestRuntimeToken = typeof this.requestCartTransformRuntimeToken === 'function'
        ? this.requestCartTransformRuntimeToken
        : fullPageStepFooterMethods.requestCartTransformRuntimeToken;
      const runtimeToken = await requestRuntimeToken.call(this, items, {
        offerGroupId: baseOfferId,
        bundleType: 'full_page',
      });
      items = mergeDuplicateCartLines(itemsForRuntimeToken);
      items.forEach(item => {
        item.properties._wolfpack_bundle_runtime = runtimeToken;
        delete item._runtimeProductId;
      });

      // Add to Shopify cart
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMessage = `Failed to add bundle to cart (${response.status})`;
        try {
          const payload = JSON.parse(responseText);
          errorMessage = payload?.message || payload?.description || errorMessage;
        } catch {
          if (responseText) {
            errorMessage = responseText;
          }
        }
        throw new Error(errorMessage);
      }

      await response.json();

      await this.syncBundleDetailsCartMetafield(`${offerId}_${sessionKey}`, sourceProperties);

      // Storefront analytics: bundle successfully added to cart.
      this._sendEngagementBeacon?.('bundle-add-to-cart-success');
      this._emitStorefrontEvent('bundle-add-to-cart-success', { itemCount: items.length, lineCount: selectedLines.length });

      // Show success message
      ToastManager.show('Bundle added to cart successfully!');
      await this._handlePostAddToCartAction(
        this._getLandingPageControls()?.checkout,
        baseOfferId,
      );

    } catch (fetchError) {
      this._emitStorefrontEvent('bundle-add-to-cart-failed', { reason: 'fetch-error', message: String(fetchError && fetchError.message || fetchError) });
      ToastManager.show(
        String(fetchError && fetchError.message) || 'Failed to add bundle to cart. Please try again.'
      );
    }

  } catch (error) {
    this._emitStorefrontEvent('bundle-add-to-cart-failed', { reason: 'validation-error', message: String(error && error.message || error) });
    ToastManager.show('Failed to add bundle to cart. Please try again.');
  } finally {
    this.hideLoadingOverlay();
    this._setWidgetBusy(false, actionButton);
  }
},

parseRuntimeAddonDiscount(stepType) {
  if (typeof stepType !== 'string') return null;
  const parts = stepType.split(':');
  if (parts.length !== 3 || parts[0] !== 'addon' || String(parts[1]).toUpperCase() !== 'PERCENTAGE') {
    return null;
  }
  const value = Number(parts[2]);
  if (!Number.isFinite(value) || value <= 0) return null;
  return { type: 'PERCENTAGE', value: Math.min(100, value) };
},

async requestCartTransformRuntimeToken(items, { offerGroupId, bundleType }) {
  const components = [];
  const addons = [];
  const parseAddonDiscount = typeof this.parseRuntimeAddonDiscount === 'function'
    ? this.parseRuntimeAddonDiscount
    : fullPageStepFooterMethods.parseRuntimeAddonDiscount;

  items.forEach((item) => {
    const stepType = item?.properties?._bundle_step_type;
    const isAddon = stepType === 'addon' || (typeof stepType === 'string' && stepType.startsWith('addon:'));
    const line = {
      variantId: item.id,
      productId: item._runtimeProductId || item.productId || undefined,
      quantity: item.quantity,
    };
    if (isAddon) {
      addons.push({
        ...line,
        discount: parseAddonDiscount.call(this, stepType),
      });
    } else {
      components.push(line);
    }
  });

  const response = await fetch('/apps/product-bundles/api/cart-transform-runtime-token', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bundleId: this.selectedBundle?.id,
      bundleType,
      offerGroupId,
      components,
      addons,
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.token) {
    throw new Error(data?.error || 'Unable to validate bundle selection');
  }
  return data.token;
},

createStepElement(step, index) {
  const stepBox = document.createElement('div');
  stepBox.className = 'step-box';
  stepBox.dataset.stepIndex = index;

  const selectedProducts = this.selectedProducts[index] || {};
  const hasSelections = Object.values(selectedProducts).some(qty => qty > 0);

  if (hasSelections) {
    stepBox.classList.add('step-completed');

    // Add close icon badge at top right to clear all selections
    const clearBadge = document.createElement('div');
    clearBadge.className = 'step-clear-badge';
    clearBadge.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#f3f4f6"/>
        <path d="M8 8L16 16M16 8L8 16" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    clearBadge.title = 'Remove all products from this step';
    clearBadge.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent opening modal
      this.clearStepSelections(index);
    });
    stepBox.appendChild(clearBadge);

    // Show product images if available
    const productImages = this.getStepProductImages(index);
    if (productImages.length > 0) {
      const imagesContainer = document.createElement('div');
      imagesContainer.className = 'step-images';

      productImages.slice(0, 4).forEach(imageData => {
        const img = document.createElement('img');
        img.src = imageData.url;
        img.alt = imageData.alt;
        img.className = 'step-image';
        imagesContainer.appendChild(img);
      });

      stepBox.appendChild(imagesContainer);

      // Add count badge if more than 4 products
      const totalQuantity = Object.values(selectedProducts).reduce((sum, qty) => sum + qty, 0);
      if (productImages.length > 4 || totalQuantity > 4) {
        const countBadge = document.createElement('div');
        countBadge.className = 'image-count-badge';
        countBadge.textContent = totalQuantity.toString();
        stepBox.appendChild(countBadge);
      }
    } else {
      // Fallback checkmark icon
      const checkIcon = document.createElement('span');
      checkIcon.className = 'check-icon';
      checkIcon.textContent = '✓';
      stepBox.appendChild(checkIcon);
    }
  } else {
    // Plus icon for empty steps
    const plusIcon = document.createElement('span');
    plusIcon.className = 'plus-icon';
    plusIcon.textContent = '+';
    stepBox.appendChild(plusIcon);
  }

  // Only show step name and selection count if no selections made
  if (!hasSelections) {
    // Add step name (without step number)
    const stepName = document.createElement('p');
    stepName.className = 'step-name';
    stepName.textContent = step.name || `Step ${index + 1}`;
    stepBox.appendChild(stepName);

    // Add selection count
    const selectionCount = document.createElement('div');
    selectionCount.className = 'step-selection-count';
    selectionCount.textContent = this.getStepSelectionText(selectedProducts);
    stepBox.appendChild(selectionCount);
  }

  // Add click handler
  stepBox.addEventListener('click', () => this.openModal(index));

  return stepBox;
},

getStepProductImages(stepIndex) {
  const selectedProducts = this.selectedProducts[stepIndex] || {};
  const productImages = [];

  Object.entries(selectedProducts).forEach(([variantId, quantity]) => {
    if (quantity > 0) {
      const product = this.stepProductData[stepIndex].find(p => String(p.selectionId || '') === String(variantId));
      if (product && product.imageUrl && !productImages.find(img => img.url === product.imageUrl)) {
        productImages.push({
          url: product.imageUrl,
          alt: product.title || ''
        });
      }
    }
  });

  return productImages;
},

getStepSelectionText(selectedProducts) {
  const totalSelected = Object.values(selectedProducts).reduce((sum, qty) => sum + (qty || 0), 0);
  return totalSelected > 0 ? `${totalSelected} selected` : '';
},

clearStepSelections(stepIndex) {
  // Clear all product selections for this step
  this.selectedProducts[stepIndex] = {};

  // Update UI
  this.renderSteps();

  // Show toast notification
  ToastManager.show('All selections cleared from this step');
},

getDiscountProgressState(totalPrice = 0, totalQuantity = 0) {
  const pricing = this.selectedBundle?.pricing;
  const rules = Array.isArray(pricing?.rules) ? pricing.rules : [];
  const tierTextByRuleId = pricing?.messages?.tierTextByRuleId || {};
  const boxRules = this.getBoxSelectionRules();
  const eligibleRules = rules
    .filter(rule => rule && (rule.conditionType === 'quantity' || rule.conditionType === 'amount'))
    .sort((a, b) => (Number(a.conditionValue || 0) || 0) - (Number(b.conditionValue || 0) || 0));
  const reachedByIndex = eligibleRules.map((rule) => {
    const threshold = Number(rule.conditionValue || 0) || 0;
    const currentValue = rule.conditionType === 'amount'
      ? Number(totalPrice || 0)
      : Number(totalQuantity || 0);
    return PricingCalculator.checkCondition(
      currentValue,
      rule.conditionOperator,
      threshold
    );
  });
  const activeIndex = reachedByIndex.findIndex(isReached => !isReached);
  const milestoneCount = eligibleRules.length;
  const milestones = eligibleRules
    .map((rule, index) => {
      const ruleId = String(rule.id || '');
      const threshold = Number(rule.conditionValue || 0) || 0;
      const tierText = tierTextByRuleId?.[ruleId] || {};
      const boxRule = boxRules.find(box => box.ruleId === ruleId);
      const discountMethod = pricing?.method || BUNDLE_WIDGET.DISCOUNT_METHODS.PERCENTAGE_OFF;
      const discountValue = Number(rule.discountValue ?? rule.discount?.value ?? 0) || 0;
      const fallbackTitle = rule.conditionType === 'quantity' && threshold > 0
        ? `${threshold} Pack`
        : String(threshold);
      let fallbackSubTitle = '';
      if (discountValue > 0) {
        if (discountMethod === BUNDLE_WIDGET.DISCOUNT_METHODS.PERCENTAGE_OFF) {
          fallbackSubTitle = `Save ${Math.round(discountValue)}%`;
        } else if (discountMethod === BUNDLE_WIDGET.DISCOUNT_METHODS.FIXED_AMOUNT_OFF) {
          fallbackSubTitle = `Save ${CurrencyManager.convertAndFormat(discountValue, CurrencyManager.getCurrencyInfo())}`;
        }
      }
      const isReached = reachedByIndex[index];
      const state = isReached ? 'reached' : index === activeIndex ? 'active' : 'pending';

      return {
        ruleId,
        title: tierText.tierText || boxRule?.boxLabel || fallbackTitle,
        subTitle: tierText.tierSubtext || boxRule?.boxSubtext || fallbackSubTitle,
        threshold,
        conditionType: rule.conditionType,
        position: milestoneCount > 0 ? Math.round(((index + 1) / milestoneCount) * 100) : 0,
        state,
        isReached,
      };
    })
    .filter(milestone => milestone.ruleId && milestone.title);

  if (!milestones.length) {
    return { milestones: [], progressPercent: 0 };
  }

  const activeMilestoneIndex = milestones.findIndex(milestone => milestone.state === 'active');
  if (activeMilestoneIndex === -1) {
    return { milestones, progressPercent: 100 };
  }

  const activeMilestone = milestones[activeMilestoneIndex];
  let previousMatchingMilestone = null;
  for (let index = activeMilestoneIndex - 1; index >= 0; index -= 1) {
    if (milestones[index].conditionType === activeMilestone.conditionType) {
      previousMatchingMilestone = milestones[index];
      break;
    }
  }

  const currentValue = activeMilestone.conditionType === 'amount'
    ? Number(totalPrice || 0)
    : Number(totalQuantity || 0);
  const segmentStartValue = previousMatchingMilestone?.threshold || 0;
  const segmentStartPosition = previousMatchingMilestone?.position || 0;
  const segmentRange = activeMilestone.threshold - segmentStartValue;
  const segmentRatio = segmentRange > 0
    ? Math.max(0, Math.min(1, (currentValue - segmentStartValue) / segmentRange))
    : 0;
  const progressPercent = Math.round(
    segmentStartPosition
      + ((activeMilestone.position - segmentStartPosition) * segmentRatio)
  );

  return { milestones, progressPercent };
},

getDiscountProgressMilestones(totalPrice = 0, totalQuantity = 0) {
  return this.getDiscountProgressState(totalPrice, totalQuantity).milestones;
},

// Returns a .fpb-discount-progress fill-bar element, or null when pricing is disabled.
// Used by the FPB floating footer and the sidebar panel (gated by showDiscountProgressBar).
};
