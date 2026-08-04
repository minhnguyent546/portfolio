import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://minhnguyent546.io.vn",
    title: "Minh-Thien Nguyen",
    description:
      "Independent AI Researcher — inference-time scaling, symbolic reasoning, and high-performance model serving.",
    author: "Minh-Thien Nguyen",
    profile: "https://minhnguyent546.io.vn",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "Asia/Ho_Chi_Minh",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: true,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    {
      name: "github",
      url: "https://github.com/minhnguyent546",
      linkTitle: "Browse my repositories on GitHub",
    },
    {
      name: "x",
      url: "https://x.com/minhnguyent546/",
      linkTitle: "Read my updates on X",
    },
    {
      name: "linkedin",
      url: "https://www.linkedin.com/in/minhnguyent546/",
      linkTitle: "Connect with me on LinkedIn",
    },
    {
      name: "mail",
      url: "mailto:minhnguyent546@gmail.com",
      linkTitle: "Send me an email",
    },
    {
      name: "googleScholar",
      url: "https://scholar.google.com/citations?hl=en&user=0DsVBW4AAAAJ",
      linkTitle: "Browse my publications on Google Scholar",
    },
    {
      name: "hackmd",
      url: "https://hackmd.io/@minhnguyent546",
      linkTitle: "Read my notes on HackMD",
    },
  ],
  shareLinks: [
    { name: "whatsapp", url: "https://wa.me/?text=" },
    { name: "facebook", url: "https://www.facebook.com/sharer.php?u=" },
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "telegram", url: "https://t.me/share/url?url=" },
    { name: "pinterest", url: "https://pinterest.com/pin/create/button/?url=" },
    { name: "mail", url: "mailto:?subject=See%20this%20post&body=" },
  ],
});
