function uid() {
  return Math.random().toString(36).slice(2, 8);
}

export function generateLandingTemplate(productData, copyData) {
  const templateName = `landing-${uid()}`;

  const ids = {
    // Main product blocks
    review_numbers: `review_numbers_${uid()}`,
    title: `title_${uid()}`,
    subtitle: `product_subtitle_${uid()}`,
    price: `price_${uid()}`,
    div1: `divider_${uid()}`,
    benefit1: `benefit_${uid()}`,
    benefit2: `benefit_${uid()}`,
    benefit3: `benefit_${uid()}`,
    benefit4: `benefit_${uid()}`,
    pp_text_extra: `pp_text_${uid()}`,
    fomo: `fomo_${uid()}`,
    div2: `divider_${uid()}`,
    quantity: `quantity_${uid()}`,
    variant: `variant_picker_${uid()}`,
    buy: `buy_buttons_${uid()}`,
    payment: `payment_${uid()}`,
    shipping: `shipping_${uid()}`,
    icons: `icons_with-text_${uid()}`,
    div3: `divider_${uid()}`,
    review_block: `review_block_${uid()}`,
    div4: `divider_${uid()}`,
    exp1: `expandable_${uid()}`,
    exp2: `expandable_${uid()}`,
    // Sections
    brands1: `brands_${uid()}`,
    imgText1: `image_with-text_${uid()}`,
    benefits: `image_with-benefits_${uid()}`,
    differences: `differences_${uid()}`,
    percentage: `image_with-percentage_${uid()}`,
    imgText2: `image_with-text_${uid()}`,
    brands2: `brands_${uid()}`,
    faqs: `pp_faqs_v1_0_0_${uid()}`,
    cta: `call_to-action_${uid()}`,
    reviews: `review_grid_${uid()}`,
    recommended: `recommended_products_${uid()}`,
    // Brands blocks
    brand1_img1: `image_${uid()}`,
    brand1_img2: `image_${uid()}`,
    brand1_img3: `image_${uid()}`,
    brand2_img1: `image_${uid()}`,
    brand2_img2: `image_${uid()}`,
    brand2_img3: `image_${uid()}`,
    // Image text 1 blocks
    it1_heading: `heading_${uid()}`,
    it1_text: `text_${uid()}`,
    it1_button: `button_${uid()}`,
    // Benefits blocks
    ben1: `benefit_${uid()}`,
    ben2: `benefit_${uid()}`,
    ben3: `benefit_${uid()}`,
    ben4: `benefit_${uid()}`,
    // Differences blocks
    comp1: `comparison_${uid()}`,
    comp2: `comparison_${uid()}`,
    comp3: `comparison_${uid()}`,
    comp4: `comparison_${uid()}`,
    comp5: `comparison_${uid()}`,
    // Percentage blocks
    pct_heading: `heading_${uid()}`,
    pct_items: `percentage_items_${uid()}`,
    pct_button: `button_${uid()}`,
    // Image text 2 blocks
    it2_heading: `heading_${uid()}`,
    it2_text: `text_${uid()}`,
    it2_button: `button_${uid()}`,
    // FAQ blocks
    faq1: `faq_item_${uid()}`,
    faq2: `faq_item_${uid()}`,
    faq3: `faq_item_${uid()}`,
    faq4: `faq_item_${uid()}`,
    // CTA blocks
    cta_heading: `heading_${uid()}`,
    cta_text: `text_${uid()}`,
    cta_button: `button_${uid()}`,
    // Review blocks
    rev1: `review_${uid()}`,
    rev2: `review_${uid()}`,
    rev3: `review_${uid()}`,
    rev4: `review_${uid()}`,
    rev5: `review_${uid()}`,
    rev6: `review_${uid()}`,
    rev7: `review_${uid()}`,
    rev8: `review_${uid()}`,
    rev9: `review_${uid()}`,
    rev10: `review_${uid()}`,
    rev11: `review_${uid()}`,
    rev12: `review_${uid()}`,
    rev13: `review_${uid()}`,
    rev14: `review_${uid()}`,
    rev15: `review_${uid()}`,
    rev16: `review_${uid()}`,
    rev17: `review_${uid()}`,
  };

  const c = copyData || {};
  const benefits = c.benefit_texts || [];
  const benefitCards = c.benefit_cards || [];
  const compRows = c.comparison_rows || [];
  const faqItems = c.faq_items || [];
  const reviews = c.reviews || [];
  const pctStats = c.percentage_stats || {};
  const imgTextSections = c.image_text_sections || [];
  const it1 = imgTextSections[0] || {};
  const it2 = imgTextSections[1] || {};

  const template = {
    sections: {
      // ========== MAIN PRODUCT ==========
      main: {
        type: "main-product",
        blocks: {
          [ids.review_numbers]: {
            type: "pp_review_numbers",
            settings: {
              rating: 5,
              stars_color: "#facc15",
              review_count: c.review_count || 343,
              review_text: "recensioni",
            },
          },
          [ids.title]: {
            type: "title",
            settings: {
              title_size: 28,
              title_height: 120,
              text_transform: "none",
            },
          },
          [ids.subtitle]: {
            type: "pp_text",
            settings: {
              text: `<strong>${c.product_subtitle || ""}</strong>`,
              text_style: "subtitle",
            },
          },
          [ids.price]: {
            type: "price",
            settings: {
              price_style: "price",
              price_size: 20,
              badge_text_1: 13,
              price_first: false,
              badge_bg_1: "#ffffff",
              badge_price_1: "#cc0d39",
              price_size_2: 1,
              badge_price: "#8b8d8f",
              price_bold_2: false,
              sale_price_color: "#1f1d24",
              regular_price_color: "#212121",
              price_bold: true,
              badge_hide: false,
              taxes_hide: false,
              shipping_hide: false,
              padding_top: 4,
              padding_bottom: 4,
            },
          },
          [ids.div1]: {
            type: "pp_divider",
            disabled: true,
            settings: {},
          },
          [ids.benefit1]: {
            type: "pp_text",
            settings: {
              text: benefits[0] || "",
              text_style: "body",
            },
          },
          [ids.benefit2]: {
            type: "pp_text",
            settings: {
              text: benefits[1] || "",
              text_style: "body",
            },
          },
          [ids.benefit3]: {
            type: "pp_text",
            settings: {
              text: benefits[2] || "",
              text_style: "body",
            },
          },
          [ids.benefit4]: {
            type: "pp_text",
            settings: {
              text: benefits[3] || "",
              text_style: "body",
            },
          },
          [ids.fomo]: {
            type: "fomo",
            settings: {
              fomo_text_before: "(x) Visitatori",
              text_style: "body",
              text_size: 14,
              color_scheme: "background-1",
              fomo_border_activate: false,
              fomo_border: 0,
              fomo_border_color: "#efefef",
              pill_color: "#000000",
              fomo_min: 5,
              fomo_max: 9,
              fomo_speed: 3,
              padding_top: 12,
              padding_bottom: 12,
              margin_top: 36,
              margin_bottom: 36,
            },
          },
          [ids.div2]: {
            type: "pp_divider",
            disabled: true,
            settings: {},
          },
          [ids.quantity]: {
            type: "quantity_selector",
            disabled: true,
            settings: {
              enable_quantity_discounts: false,
              headline: "BUNDLE & SAVE",
              txt_size_head_qb: 18,
              sub_headline: "This offer is for limited time only",
              txt_size_subhead_qb: 12,
              background_top_qb: "#ffffff",
              background_top_text_qb: "#212121",
              background_qb: "#ffffff",
              border_qb: "#000000",
              check_bg_qb: "#e9ecef",
              check_border_qb: "#000000",
              check_dot: "#000000",
              hover_bg_qb: "#ffffff",
              hover_border_qb: "#000000",
              badge_qb: "#000000",
              badge_qb_text: "#ffffff",
              compare_price: "#000000",
              qb_border_wd: 2,
              qb_border: 4,
              padding_top: 20,
              padding_bottom: 20,
              preselected: "option_2",
              display_badge: "option_2",
              badge_text: "Most Popular",
              option_1_quantity: 1,
              option_1_label: "",
              option_1_benefit: "",
              option_1_caption: "Only [item_price] per Item",
              option_1_discount_type: "none",
              option_1_percentage_off: 0,
              option_1_fixed_amount_off: "0",
              option_2_quantity: 2,
              option_2_label: "",
              option_2_benefit: "",
              option_2_caption: "Only [item_price] per Item",
              option_2_discount_type: "percentage",
              option_2_percentage_off: 20,
              option_2_fixed_amount_off: "0",
              option_3_quantity: 3,
              option_3_label: "",
              option_3_benefit: "",
              option_3_caption: "Only [item_price] per Item",
              option_3_discount_type: "percentage",
              option_3_percentage_off: 30,
              option_3_fixed_amount_off: "0",
              option_4_quantity: 4,
              option_4_label: "",
              option_4_benefit: "",
              option_4_caption: "Only [item_price] per Item",
              option_4_discount_type: "percentage",
              option_4_percentage_off: 40,
              option_4_fixed_amount_off: "0",
            },
          },
          [ids.variant]: {
            type: "variant_picker",
            disabled: true,
            settings: {
              picker_type: "button",
              label_style: "body",
              font_size: 14,
              font_style: "normal",
              swatchType: "color",
              optionName: "Color",
              swatchStyle: "round",
              swatchSize: 30,
              swatchHeight: 30,
              size_trigger: "",
              chart_id: "Size Chart",
              size_page: "",
            },
          },
          [ids.buy]: {
            type: "buy_buttons",
            settings: {
              show_dynamic_checkout: true,
              show_full_button: true,
              lm_main_button: "#000000",
              lm_main_button_gr: "",
              lm_main_text: "#ffffff",
              lm_button_animation: "ripple",
              show_gift_card_recipient: true,
              skip_cart: true,
              cart_text: "",
            },
          },
          [ids.payment]: {
            type: "payment",
            settings: {
              original: "custom",
              payment_icon: "visa,master,paypal,apple_pay,shopify-pay,google-pay",
              payment_content_alignment: "center",
            },
          },
          [ids.shipping]: {
            type: "shipping",
            settings: {
              ship_days: 2,
              cut_off_time: 16,
              icon_size: 20,
              image_ani: "none",
              text_size: 10,
              text_style: "uppercase",
              text: "Ordina in (timer) per riceverlo (date)",
              date_locale: "it-IT",
              ship_bg: "rgba(0,0,0,0)",
              show_border: false,
              ship_border: "#f2f2f2",
              border_radius: 0,
              padding_top: 12,
              padding_bottom: 12,
              margin_top: 16,
              margin_bottom: 16,
            },
          },
          [ids.icons]: {
            type: "pp_icons_with_text",
            settings: {
              icons_size: 30,
              guarantee_1_icon: "truck",
              guarantee_1_text: "Spedizione veloce",
              guarantee_2_icon: "box",
              guarantee_2_text: "Resi gratuiti",
              guarantee_3_icon: "heart",
              guarantee_3_text: "Garanzia 30 giorni",
            },
          },
          [ids.div3]: {
            type: "pp_divider",
            settings: {},
          },
          [ids.review_block]: {
            type: "pp_review_block",
            settings: {
              rating: 5,
              stars_color: "#facc15",
              image: "",
              review: c.inline_review_text || "",
              name: c.inline_review_name || "Maria R.",
            },
          },
          [ids.div4]: {
            type: "pp_divider",
            settings: {},
          },
          [ids.exp1]: {
            type: "pp_expandable_text",
            settings: {
              title: "Informazioni sulla spedizione",
              content: "<p>Offriamo spedizione tracciata e assicurata per tutti i nostri ordini. L'elaborazione dell'ordine richiede 1-3 giorni lavorativi prima della spedizione.</p>",
              icon: "globe",
            },
          },
          [ids.exp2]: {
            type: "pp_expandable_text",
            settings: {
              title: "Politica di reso",
              content: "<p>Amiamo i nostri prodotti e siamo sicuri che li amerai anche tu! Per questo offriamo una prova di 30 giorni senza rischi. Se non sei soddisfatto dei risultati, ti rimborseremo.</p>",
              icon: "back",
            },
          },
        },
        block_order: [
          ids.review_numbers,
          ids.title,
          ids.subtitle,
          ids.price,
          ids.div1,
          ids.benefit1,
          ids.benefit2,
          ids.benefit3,
          ids.benefit4,
          ids.fomo,
          ids.div2,
          ids.quantity,
          ids.variant,
          ids.buy,
          ids.payment,
          ids.shipping,
          ids.icons,
          ids.div3,
          ids.review_block,
          ids.div4,
          ids.exp1,
          ids.exp2,
        ],
        custom_css: [],
        settings: {
          enable_sticky_info: true,
          show_feature_media: false,
          color_scheme: "",
          show_container: true,
          container_radius: 10,
          container_padding: 30,
          container_color: "#ffffff",
          container_border_color: "#000000",
          container_text: "",
          container_text_bg: "#212121",
          container_text_txt: "#ffffff",
          show_container_mb: true,
          container_padding_mb: 20,
          container_radius_mb: 8,
          container_color_mb: "#ffffff",
          container_border_color_mb: "#e0e0e0",
          media_size: "medium",
          constrain_to_viewport: false,
          media_fit: "contain",
          gallery_layout: "stacked",
          thumbnail_size: 70,
          thumbnail_radius: 4,
          media_position: "left",
          image_zoom: "none",
          mobile_thumbnails: "show",
          show_full_image: true,
          first_image_size: 100,
          second_image_size: 0,
          hide_variants: true,
          enable_video_looping: true,
          padding_top: 8,
          padding_bottom: 76,
          padding_top_mb: 0,
          padding_bottom_mb: 36,
          heading_font_size: 24,
          body_font_size: 16,
          mobile_heading_font_size: 24,
          mobile_body_font_size: 14,
          pp_heading_color: "#000000",
          pp_body_color: "#000000",
          pp_brand_color: "#000000",
          pp_button_background_color: "#000000",
          pp_button_text_color: "#ffffff",
          pp_border_radius: 16,
        },
      },

      // ========== LOGO SLIDER 1 ==========
      [ids.brands1]: {
        type: "brands",
        blocks: {
          [ids.brand1_img1]: { type: "image", settings: { logo_image_width: 200 } },
          [ids.brand1_img2]: { type: "image", settings: { logo_image_width: 200 } },
          [ids.brand1_img3]: { type: "image", settings: { logo_image_width: 200 } },
        },
        block_order: [ids.brand1_img1, ids.brand1_img2, ids.brand1_img3],
        name: "LOGO Slider",
        settings: {
          scroll_speed: 15,
          fade: false,
          color_scheme: "",
          padding_desktop: 16,
          padding_mobile: 8,
          padding_item_desktop: 36,
          padding_item_mobile: 24,
          padding_top: 0,
          padding_bottom: 0,
        },
      },

      // ========== PP IMAGE WITH TEXT 1 ==========
      [ids.imgText1]: {
        type: "pp-image-with-text-v1-0-0",
        blocks: {
          [ids.it1_heading]: {
            type: "heading",
            settings: { heading: it1.heading || "" },
          },
          [ids.it1_text]: {
            type: "text",
            settings: { text: it1.text || "" },
          },
          [ids.it1_button]: {
            type: "button",
            settings: {
              button_behaviour: "scroll_to_top",
              button_label: "Lo voglio",
              button_link: "",
            },
          },
        },
        block_order: [ids.it1_heading, ids.it1_text, ids.it1_button],
        settings: {
          image: "",
          image_alt: productData.short_title || productData.title || "",
          layout: "image_first",
          desktop_content_position: "center",
          desktop_content_alignment: "left",
          mobile_content_alignment: "center",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 0,
        },
      },

      // ========== PP IMAGE WITH BENEFITS ==========
      [ids.benefits]: {
        type: "pp-image-with-benefits-v1-0-0",
        blocks: {
          [ids.ben1]: {
            type: "benefit",
            settings: {
              icon: benefitCards[0]?.icon || "",
              title: benefitCards[0]?.title || "",
              description: benefitCards[0]?.description || "",
            },
          },
          [ids.ben2]: {
            type: "benefit",
            settings: {
              icon: benefitCards[1]?.icon || "",
              title: benefitCards[1]?.title || "",
              description: benefitCards[1]?.description || "",
            },
          },
          [ids.ben3]: {
            type: "benefit",
            settings: {
              icon: benefitCards[2]?.icon || "",
              title: benefitCards[2]?.title || "",
              description: benefitCards[2]?.description || "",
            },
          },
          [ids.ben4]: {
            type: "benefit",
            settings: {
              icon: benefitCards[3]?.icon || "",
              title: benefitCards[3]?.title || "",
              description: benefitCards[3]?.description || "",
            },
          },
        },
        block_order: [ids.ben1, ids.ben2, ids.ben3, ids.ben4],
        settings: {
          heading: c.benefits_heading || "",
          subtitle: c.benefits_subtitle || "",
          image: "",
          image_rounded_type: "circle",
          desktop_content_alignment: "center",
          mobile_content_alignment: "center",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 30,
        },
      },

      // ========== PP DIFFERENCES ==========
      [ids.differences]: {
        type: "pp-differences-v1-0-0",
        blocks: {
          [ids.comp1]: {
            type: "comparison_item",
            settings: { feature: compRows[0]?.feature || "", product_has_feature: true, competitor_has_feature: false },
          },
          [ids.comp2]: {
            type: "comparison_item",
            settings: { feature: compRows[1]?.feature || "", product_has_feature: true, competitor_has_feature: false },
          },
          [ids.comp3]: {
            type: "comparison_item",
            settings: { feature: compRows[2]?.feature || "", product_has_feature: true, competitor_has_feature: false },
          },
          [ids.comp4]: {
            type: "comparison_item",
            settings: { feature: compRows[3]?.feature || "", product_has_feature: true, competitor_has_feature: false },
          },
          [ids.comp5]: {
            type: "comparison_item",
            settings: { feature: compRows[4]?.feature || "", product_has_feature: true, competitor_has_feature: false },
          },
        },
        block_order: [ids.comp1, ids.comp2, ids.comp3, ids.comp4, ids.comp5],
        settings: {
          heading: c.comparison_heading || "",
          description: c.comparison_description || "",
          button_label: "Aggiungi al carrello",
          button_link: "",
          product_title: productData.short_title || productData.title || "",
          competitor_title: "Altri",
          button_behaviour: "scroll_to_top",
          layout: "text_first",
          content_position: "center",
          desktop_content_alignment: "left",
          mobile_content_alignment: "center",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 0,
        },
      },

      // ========== PP IMAGE WITH PERCENTAGE ==========
      [ids.percentage]: {
        type: "pp-image-with-percentage-v1-0-0",
        blocks: {
          [ids.pct_heading]: {
            type: "heading",
            settings: { heading: c.percentage_heading || "Risultati che noti subito" },
          },
          [ids.pct_items]: {
            type: "percentage_items",
            settings: {
              color_end: "#d1d5db",
              percentage_1: pctStats.percentage_1 || 98,
              text_1: pctStats.text_1 || "",
              percentage_2: pctStats.percentage_2 || 97,
              text_2: pctStats.text_2 || "",
              percentage_3: pctStats.percentage_3 || 96,
              text_3: pctStats.text_3 || "",
            },
          },
          [ids.pct_button]: {
            type: "button",
            disabled: true,
            settings: {
              button_behaviour: "scroll_to_top",
              button_label: "Lo voglio",
              button_link: "",
            },
          },
        },
        block_order: [ids.pct_heading, ids.pct_items, ids.pct_button],
        settings: {
          image: "",
          layout: "image_first",
          desktop_content_alignment: "left",
          mobile_content_alignment: "center",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 30,
        },
      },

      // ========== PP IMAGE WITH TEXT 2 ==========
      [ids.imgText2]: {
        type: "pp-image-with-text-v1-0-0",
        blocks: {
          [ids.it2_heading]: {
            type: "heading",
            settings: { heading: it2.heading || "" },
          },
          [ids.it2_text]: {
            type: "text",
            settings: { text: it2.text || "" },
          },
          [ids.it2_button]: {
            type: "button",
            settings: {
              button_behaviour: "scroll_to_top",
              button_label: "Lo voglio",
              button_link: "",
            },
          },
        },
        block_order: [ids.it2_heading, ids.it2_text, ids.it2_button],
        settings: {
          image: "",
          image_alt: productData.short_title || productData.title || "",
          layout: "text_first",
          desktop_content_position: "center",
          desktop_content_alignment: "left",
          mobile_content_alignment: "center",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 0,
        },
      },

      // ========== LOGO SLIDER 2 ==========
      [ids.brands2]: {
        type: "brands",
        blocks: {
          [ids.brand2_img1]: { type: "image", settings: { logo_image_width: 200 } },
          [ids.brand2_img2]: { type: "image", settings: { logo_image_width: 200 } },
          [ids.brand2_img3]: { type: "image", settings: { logo_image_width: 200 } },
        },
        block_order: [ids.brand2_img1, ids.brand2_img2, ids.brand2_img3],
        name: "LOGO Slider",
        settings: {
          scroll_speed: 15,
          fade: false,
          color_scheme: "",
          padding_desktop: 16,
          padding_mobile: 8,
          padding_item_desktop: 36,
          padding_item_mobile: 24,
          padding_top: 0,
          padding_bottom: 0,
        },
      },

      // ========== PP FAQ ==========
      [ids.faqs]: {
        type: "pp-faqs-v1-0-0",
        blocks: {
          [ids.faq1]: {
            type: "faq_item",
            settings: { question: faqItems[0]?.question || "", answer: faqItems[0]?.answer || "" },
          },
          [ids.faq2]: {
            type: "faq_item",
            settings: { question: faqItems[1]?.question || "", answer: faqItems[1]?.answer || "" },
          },
          [ids.faq3]: {
            type: "faq_item",
            settings: { question: faqItems[2]?.question || "", answer: faqItems[2]?.answer || "" },
          },
          [ids.faq4]: {
            type: "faq_item",
            settings: { question: faqItems[3]?.question || "", answer: faqItems[3]?.answer || "" },
          },
        },
        block_order: [ids.faq1, ids.faq2, ids.faq3, ids.faq4],
        name: "PP FAQ",
        settings: {
          heading: "Frequently Asked Questions",
          description: "Your answer might be here! Find the answers most valued by our customers.",
          desktop_content_alignment: "center",
          mobile_content_alignment: "center",
          button_behaviour: "link",
          button_label: "",
          button_link: "",
          faqitem_background: "",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 30,
        },
      },

      // ========== PP CALL TO ACTION ==========
      [ids.cta]: {
        type: "pp-call-to-action-v1-0-0",
        blocks: {
          [ids.cta_heading]: {
            type: "heading",
            settings: { heading: c.cta_heading || "" },
          },
          [ids.cta_text]: {
            type: "text",
            settings: { text: c.cta_text || "" },
          },
          [ids.cta_button]: {
            type: "button",
            settings: {
              button_behaviour: "scroll_to_top",
              button_label: "Lo voglio",
              button_link: "",
            },
          },
        },
        block_order: [ids.cta_heading, ids.cta_text, ids.cta_button],
        settings: {
          guarantee_icon: "certification",
          icon_size: 72,
          desktop_content_alignment: "center",
          mobile_content_alignment: "center",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 30,
        },
      },

      // ========== PP REVIEW GRID ==========
      [ids.reviews]: buildReviewGrid(ids, reviews),

      // ========== PP RECOMMENDED PRODUCTS (disabled) ==========
      [ids.recommended]: {
        type: "pp-recommended-products-v1-0-0",
        disabled: true,
        settings: {
          heading: "Prodotti consigliati",
          collection: "",
          desktop_content_alignment: "center",
          mobile_content_alignment: "center",
          section_background: "",
          padding_top: 30,
          padding_bottom: 30,
          padding_top_mobile: 30,
          padding_bottom_mobile: 30,
          margin_top: 30,
          margin_bottom: 30,
          margin_top_mobile: 30,
          margin_bottom_mobile: 0,
        },
      },
    },

    // ========== ORDER (exact master order) ==========
    order: [
      "main",
      ids.brands1,
      ids.imgText1,
      ids.benefits,
      ids.differences,
      ids.percentage,
      ids.imgText2,
      ids.brands2,
      ids.faqs,
      ids.cta,
      ids.reviews,
      ids.recommended,
    ],
  };

  return { templateName, template };
}

function buildReviewGrid(ids, reviews) {
  const revIds = [
    ids.rev1, ids.rev2, ids.rev3, ids.rev4, ids.rev5,
    ids.rev6, ids.rev7, ids.rev8, ids.rev9, ids.rev10,
    ids.rev11, ids.rev12, ids.rev13, ids.rev14, ids.rev15,
    ids.rev16, ids.rev17,
  ];

  const blocks = {};
  const blockOrder = [];

  for (let i = 0; i < Math.min(reviews.length, 17); i++) {
    const r = reviews[i];
    blocks[revIds[i]] = {
      type: "review",
      settings: {
        name: r.name || "",
        verified_text: "Acquirente Verificato",
        rating: r.rating || 4,
        review_text: r.text || "",
      },
    };
    blockOrder.push(revIds[i]);
  }

  return {
    type: "pp-review-grid-v1-0-0",
    blocks,
    block_order: blockOrder,
    settings: {
      rating: 5,
      heading: "Cosa dicono gli utenti",
      subheading: "Feedback veri e affidabili",
      desktop_content_alignment: "center",
      mobile_content_alignment: "center",
      section_background: "",
      padding_top: 30,
      padding_bottom: 30,
      padding_top_mobile: 30,
      padding_bottom_mobile: 30,
      margin_top: 30,
      margin_bottom: 30,
      margin_top_mobile: 30,
      margin_bottom_mobile: 30,
    },
  };
}
