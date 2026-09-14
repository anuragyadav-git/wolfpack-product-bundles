import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import { login } from "../../../shopify.server";

import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const { errors } = actionData ?? loaderData;

  return (
    <s-page heading="Log in" inlineSize="small">
      <s-section>
        <Form method="post">
          <s-stack direction="block" gap="base">
            <s-text-field
              name="shop"
              label="Shop domain"
              details="example.myshopify.com"
              autocomplete="on"
              error={errors.shop}
            />
            <s-button type="submit" variant="primary">
              Log in
            </s-button>
          </s-stack>
        </Form>
      </s-section>
    </s-page>
  );
}
