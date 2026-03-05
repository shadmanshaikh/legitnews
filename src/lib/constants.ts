export const LEGIT_DOMAINS = [
    // UAE Government
    "u.ae",
    "wam.ae",
    "uaepass.ae",
    "dubai.ae",
    "abudhabi.ae",
    "sharjah.ae",
    "ajman.ae",
    "rak.ae",
    "fujairah.ae",
    "uamm.ae",
    "government.ae",
    "gov.ae",

    // Ministries & Authorities
    "moe.gov.ae",
    "mohap.gov.ae",
    "mof.gov.ae",
    "mofaic.gov.ae",
    "moj.gov.ae",
    "moei.gov.ae",
    "mohre.gov.ae",
    "moca.gov.ae",
    "mocd.gov.ae",
    "adpolice.gov.ae",
    "dubaipolice.gov.ae",
    "dha.gov.ae",
    "rta.ae",

    // Local UAE News & Media
    "khaleejtimes.com",
    "gulfnews.com",
    "thenationalnews.com",
    "gulftoday.ae",
    "alroeya.com",
    "emaratalyoum.com",
    "albayan.ae",
    "alkhaleej.ae",
    "alittihad.ae",
    "al-ain.com",
    "emirates247.com",
    "arabianbusiness.com",
    "alarabiya.net",
    "dmi.ae",
    "sharjahmedia.ae",
    "sba.net.ae",
    "admedia.ae",
    "skynewsarabia.com",

    // International News (Press Gazette Top) & Agency
    "reuters.com",
    "apnews.com",
    "afp.com",
    "bbc.com",
    "bbc.co.uk",
    "aljazeera.com",
    "cnn.com",
    "edition.cnn.com",
    "bloomberg.com",
    "skynews.com",
    "news.sky.com",
    "france24.com",
    "dw.com",
    "rt.com",
    "trtwold.com",

    // Major Global Newspapers/Portals
    "nytimes.com",
    "wsj.com",
    "washingtonpost.com",
    "theguardian.com",
    "telegraph.co.uk",
    "independent.co.uk",
    "timesofindia.indiatimes.com",
    "hindustantimes.com",
    "ndtv.com",
    "indiatoday.in",
    "livemint.com",
    "india.com",
    "foxnews.com",
    "nbcnews.com",
    "abcnews.go.com",
    "cbsnews.com",
    "usatoday.com",
    "nypost.com",
    "dailymail.co.uk",
    "thesun.co.uk",
    "mirror.co.uk",

    // Finance & Business
    "forbes.com",
    "economist.com",
    "ft.com",
    "businessinsider.com",
    "cnbc.com",
    "finance.yahoo.com",
    "barrons.com",

    // Science & Tech
    "nature.com",
    "sciencemag.org",
    "theverge.com",
    "wired.com",
    "techcrunch.com",

    // Platforms & Aggregators
    "news.google.com",
    "yahoo.com",
    "msn.com",
    "substack.com",
    "medium.com",

    // Key Entities
    "etisalat.ae",
    "du.ae",
    "eand.com",
    "emirates.com"
];

export const INSTAGRAM_WHITELIST = [
    // Government & Official
    "uaegov",
    "wamnews",
    "dxbmediaoffice",
    "dubaimediaoffice",
    "admediaoffice",
    "sharjahmedia",
    "ajmanmedia",
    "rakmediaoffice",
    "fujairah_media_office",
    "mofuae",
    "moiuae",
    "mofaic",
    "mofa",
    "gdrfadubai",
    "hhshkmohd",
    "faz3",
    "mohamedbinzayed",
    "ncemauae",
    "gcaauae",
    "tdra_uae",

    // News Agencies & Portals
    "khaleejtimes",
    "gulfnews",
    "thenationalnews",
    "thenationalnews.uae",
    "emaratalyoum",
    "albayan_news",
    "alkhaleej.ae",
    "alittihad_news",
    "emirates247",
    "arabianbusiness",
    "alarabiya",
    "alarabiya_eng",
    "aljazeera",
    "aljazeeraenglish",
    "middleeasteye",
    "uae_barq",
    "sharjahnews",
    "7news.uae",
    "skynewsarabia",
    "admedia",

    // Key Entities
    "etisalat",
    "dutweets",
    "uaepass.ae",
    "dubai",
    "visitdubai",
    "abudhabi",
    "uaeproject",
    "expoCityDubai"
];

export const isLegitURL = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
        const hostname = parsedUrl.hostname.toLowerCase();

        // Handle Instagram check separately
        if (hostname.includes("instagram.com")) {
            const pathSegments = parsedUrl.pathname.split("/").filter(s => s.length > 0);
            if (pathSegments.length === 1) {
                return INSTAGRAM_WHITELIST.includes(pathSegments[0].toLowerCase());
            }
            // For posts/reels, return false for now (frontend will trigger server-side verification)
            return false;
        }

        // Check if hostname ends with any of the legit domains
        return LEGIT_DOMAINS.some(domain => {
            return hostname === domain || hostname.endsWith(`.${domain}`);
        });
    } catch (e) {
        return false;
    }
};
