interface UploadStoreFileResult {
  ok: boolean;
  fileId?: string;
  error?: string;
}

interface UploadStoreFileStatus {
  fileStatus?: string;
  file?: {
    id: string;
    url: string;
  };
  error?: string;
}

async function readAdminResource<T>(response: Response): Promise<T> {
  const text = await response.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!response.ok) {
    const message = typeof data === "object" && data && "error" in data
      ? String((data as { error: unknown }).error)
      : typeof data === "string" && data
        ? data
        : `Admin request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function uploadStoreFile(
  formData: FormData,
): Promise<UploadStoreFileResult> {
  const response = await fetch("/app/upload-store-file", {
    method: "POST",
    body: formData,
  });
  return readAdminResource<UploadStoreFileResult>(response);
}

export async function getUploadStoreFileStatus(
  fileId: string,
): Promise<UploadStoreFileStatus> {
  const response = await fetch(
    `/app/upload-store-file?fileId=${encodeURIComponent(fileId)}`,
    { method: "GET" },
  );
  return readAdminResource<UploadStoreFileStatus>(response);
}
