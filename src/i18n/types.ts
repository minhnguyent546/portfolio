export interface UIStrings {
  nav: {
    home: string;
    blog: string;
    tags: string;
    about: string;
    archives: string;
    search: string;
  };
  post: {
    publishedAt: string;
    updatedAt: string;
    sharePostIntro: string;
    sharePostOn: string;
    sharePostViaEmail: string;
    tagLabel: string;
    backToTop: string;
    goBack: string;
    editPage: string;
    previousPost: string;
    nextPost: string;
    copyCode: string;
    copiedCode: string;
    zoomImage: string;
    imagePreview: string;
    closeImagePreview: string;
    /** Accessible name for the anchor beside a heading. `%s` is the heading text. */
    linkToHeading: string;
    /** Names the other language, since a pair is always English plus Vietnamese. */
    switchLanguage: string;
  };
  pagination: {
    prev: string;
    next: string;
    page: string;
  };
  home: {
    socialLinks: string;
    featured: string;
    recentPosts: string;
    allPosts: string;
  };
  footer: {
    copyright: string;
    allRightsReserved: string;
  };
  pages: {
    tagTitle: string;
    tagDesc: string;

    tagsTitle: string;
    tagsDesc: string;

    blogTitle: string;
    blogDesc: string;

    archivesTitle: string;
    archivesDesc: string;

    searchTitle: string;
    searchDesc: string;
  };
  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    toggleTheme: string;
    searchPlaceholder: string;
    noResults: string;
    goToPreviousPage: string;
    goToNextPage: string;
    terminalInput: string;
  };
  notFound: {
    title: string;
    message: string;
    goHome: string;
  };
}
