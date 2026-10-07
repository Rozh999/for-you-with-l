import { fetchData } from "./api.js";
import { initCountdown } from "./countdown.js";
import { initSharedUI } from "./ui.js";

/* ---------- helpers ---------- */

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatAmount = (amount) => Number(amount).toFixed(2);

const getCreatorById = function (creators, id) {
  return creators.find((creator) => creator.id === id);
};

/* ---------- templates ---------- */

const renderCollection = function (collection, creator) {
  const [main, ...thumbs] = collection.images;

  return `
    <article class="group">
      <a href="#discover" class="block overflow-hidden rounded-[20px]">
        <img
          src="${escapeHtml(main)}"
          alt="${escapeHtml(collection.name)}"
          class="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </a>
      <div class="mt-4 grid grid-cols-3 gap-4">
        ${thumbs
          .slice(0, 2)
          .map(
            (src) => `
              <img
                src="${escapeHtml(src)}"
                alt=""
                class="aspect-square w-full rounded-[20px] object-cover"
                loading="lazy"
              />`,
          )
          .join("")}
        <div class="flex aspect-square items-center justify-center rounded-[20px] bg-accent font-mono text-[22px] font-bold">
          ${escapeHtml(collection.total_items)}+
        </div>
      </div>
      <h3 class="mt-4 text-[22px] font-semibold">${escapeHtml(collection.name)}</h3>
      <div class="mt-2.5 flex items-center gap-3">
        <img
          src="${escapeHtml(creator?.image ?? "")}"
          alt=""
          class="size-6 rounded-full object-cover"
          loading="lazy"
        />
        <span class="text-base">${escapeHtml(creator?.name ?? "Unknown")}</span>
      </div>
    </article>
  `;
};

const renderCreator = function (creator, rank) {
  return `
    <article class="relative flex items-center gap-5 rounded-[20px] bg-bg-2 p-5 md:flex-col md:items-center md:text-center">
      <span class="absolute left-5 top-5 flex size-[30px] items-center justify-center rounded-full bg-bg font-mono text-base text-caption md:left-5 md:top-5">
        ${rank}
      </span>
      <img
        src="${escapeHtml(creator.image)}"
        alt="${escapeHtml(creator.name)}"
        class="ml-10 size-[60px] rounded-full object-cover md:ml-0 md:size-[120px]"
        loading="lazy"
      />
      <div>
        <h3 class="text-[22px] font-semibold">${escapeHtml(creator.name)}</h3>
        <p class="mt-1 text-base">
          <span class="text-caption">Total Sales:</span>
          <span class="font-mono">${formatAmount(creator.total_sales)} ${escapeHtml(creator.currency)}</span>
        </p>
      </div>
    </article>
  `;
};

const renderCategory = function (category) {
  return `
    <a href="#discover" class="group block overflow-hidden rounded-[20px] bg-bg-2">
      <div class="relative aspect-square overflow-hidden md:aspect-[240/240]">
        <img
          src="${escapeHtml(category.image)}"
          alt=""
          class="size-full object-cover blur-[6px] transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div class="absolute inset-0 flex items-center justify-center bg-black/20">
          <img
            src="${escapeHtml(category.icon)}"
            alt=""
            class="size-[60px] md:size-[80px] lg:size-[100px]"
            loading="lazy"
          />
        </div>
      </div>
      <h3 class="p-5 text-base font-semibold lg:text-[22px]">${escapeHtml(category.name)}</h3>
    </a>
  `;
};

const renderNFT = function (nft, creator) {
  return `
    <article class="group overflow-hidden rounded-[20px] bg-bg-2">
      <a href="#discover" class="block overflow-hidden">
        <img
          src="${escapeHtml(nft.image)}"
          alt="${escapeHtml(nft.name)}"
          class="aspect-[330/295] w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </a>
      <div class="p-5 md:p-[30px]">
        <h3 class="text-[22px] font-semibold">${escapeHtml(nft.name)}</h3>
        <div class="mt-1.5 flex items-center gap-3 font-mono text-base">
          <img
            src="${escapeHtml(creator?.image ?? "")}"
            alt=""
            class="size-6 rounded-full object-cover"
            loading="lazy"
          />
          <span>${escapeHtml(creator?.name ?? "Unknown")}</span>
        </div>
        <div class="mt-6 flex items-start justify-between font-mono">
          <div>
            <p class="text-xs text-caption">Price</p>
            <p class="mt-2 text-base">${formatAmount(nft.price.amount)} ${escapeHtml(nft.price.currency)}</p>
          </div>
          <div class="text-right">
            <p class="text-xs text-caption">Highest Bid</p>
            <p class="mt-2 text-base">${formatAmount(nft.highest_bid.amount)} ${escapeHtml(nft.highest_bid.currency)}</p>
          </div>
        </div>
      </div>
    </article>
  `;
};

/* ---------- renderers ---------- */

const renderAllCollections = function (collections, creators) {
  const container = document.getElementById("collections");
  if (!container) return;

  container.innerHTML = collections
    .map((collection) =>
      renderCollection(
        collection,
        getCreatorById(creators, collection.creator_id),
      ),
    )
    .join("");
};

const renderAllCreators = function (creators) {
  const container = document.getElementById("creators");
  if (!container) return;

  container.innerHTML = creators
    .map((creator, index) => renderCreator(creator, index + 1))
    .join("");
};

const renderAllCategories = function (categories) {
  const container = document.getElementById("categories-grid");
  if (!container) return;

  container.innerHTML = categories.map(renderCategory).join("");
};

const renderAllNFTs = function (nfts, creators) {
  const container = document.getElementById("nfts");
  if (!container) return;

  container.innerHTML = nfts
    .map((nft) => renderNFT(nft, getCreatorById(creators, nft.creator_id)))
    .join("");
};

const renderError = function () {
  const ids = ["collections", "creators", "categories-grid", "nfts"];
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `
        <p class="col-span-full rounded-[20px] bg-bg-2 p-5 text-center text-caption">
          Sorry, we couldn't load this content right now. Please try again later.
        </p>`;
    }
  });
};

/* ---------- boot ---------- */

const loadAndRender = async function () {
  try {
    const { collections, creators, categories, nfts } = await fetchData();

    renderAllCollections(collections, creators);
    renderAllCreators(creators);
    renderAllCategories(categories);
    renderAllNFTs(nfts, creators);
  } catch (error) {
    console.error("Failed to fetch data:", error.message);
    renderError();
  }
};

initSharedUI();
initCountdown();
loadAndRender();
