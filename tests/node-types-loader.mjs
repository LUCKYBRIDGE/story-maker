export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (error) {
    const isRelativeModule =
      specifier.startsWith("./") || specifier.startsWith("../");
    const hasExtension = /\.[a-zA-Z0-9]+(?:[?#]|$)/.test(specifier);

    if (
      error?.code === "ERR_MODULE_NOT_FOUND" &&
      isRelativeModule &&
      !hasExtension
    ) {
      return nextResolve(`${specifier}.ts`, context);
    }

    throw error;
  }
}
