function apiUrl(storeUrl, path) {
  return `https://${storeUrl}/admin/api/2024-10/${path}`;
}

async function shopifyFetch(storeUrl, accessToken, path, options = {}) {
  const res = await fetch(apiUrl(storeUrl, path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Shopify API error (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function shopifyGraphQL(storeUrl, accessToken, query, variables = {}) {
  const res = await fetch(
    `https://${storeUrl}/admin/api/2024-10/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  const data = await res.json();
  if (data.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

export async function createProduct(storeUrl, accessToken, productData, copyData) {
  const product = {
    product: {
      title: productData.short_title || productData.title,
      body_html: copyData.product_description_html || productData.description,
      vendor: "Our Store",
      product_type: productData.category || "",
      tags: productData.category || "",
      status: "draft",
      variants: [
        {
          price: productData.price?.toString().replace(/[^0-9.]/g, "") || "29.99",
          compare_at_price:
            productData.original_price?.toString().replace(/[^0-9.]/g, "") || null,
          inventory_management: null,
          requires_shipping: true,
        },
      ],
      images: (productData.images || []).slice(0, 10).map((src) => ({ src })),
    },
  };

  const result = await shopifyFetch(storeUrl, accessToken, "products.json", {
    method: "POST",
    body: JSON.stringify(product),
  });

  return result.product;
}

export async function createProductTemplate(storeUrl, accessToken, templateName, templateJson) {
  const themes = await shopifyFetch(storeUrl, accessToken, "themes.json");
  const activeTheme = themes.themes.find((t) => t.role === "main");
  if (!activeTheme) {
    throw new Error("No active theme found");
  }

  const assetKey = `templates/product.${templateName}.json`;
  const result = await shopifyFetch(storeUrl, accessToken, `themes/${activeTheme.id}/assets.json`, {
    method: "PUT",
    body: JSON.stringify({
      asset: {
        key: assetKey,
        value: JSON.stringify(templateJson, null, 2),
      },
    }),
  });

  return { themeId: activeTheme.id, assetKey, result };
}

export async function assignTemplateToProduct(storeUrl, accessToken, productId, templateSuffix) {
  const gid = `gid://shopify/Product/${productId}`;
  const query = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          templateSuffix
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const result = await shopifyGraphQL(storeUrl, accessToken, query, {
    input: { id: gid, templateSuffix },
  });

  if (result.data?.productUpdate?.userErrors?.length) {
    throw new Error(
      `Failed to assign template: ${JSON.stringify(result.data.productUpdate.userErrors)}`
    );
  }

  return result.data.productUpdate.product;
}

export async function fullImport(storeUrl, accessToken, productData, copyData, templateName, templateJson) {
  console.log(`Creating product on ${storeUrl}...`);
  const product = await createProduct(storeUrl, accessToken, productData, copyData);
  console.log(`Product created: ${product.id} - ${product.title}`);

  console.log("Uploading landing page template...");
  const templateResult = await createProductTemplate(storeUrl, accessToken, templateName, templateJson);
  console.log(`Template uploaded: ${templateResult.assetKey}`);

  console.log("Assigning template to product...");
  const assigned = await assignTemplateToProduct(storeUrl, accessToken, product.id, templateName);
  console.log(`Template assigned: ${assigned.templateSuffix}`);

  return {
    product,
    templateAsset: templateResult.assetKey,
    productUrl: `https://${storeUrl}/products/${product.handle}`,
    adminUrl: `https://${storeUrl}/admin/products/${product.id}`,
  };
}
