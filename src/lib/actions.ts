"use server";

import { INSTAGRAM_WHITELIST, LEGIT_DOMAINS } from "./constants";

/**
 * Super Verification Action - V4 (Social Crawler Mimicry)
 */
export async function verifyLink(url: string) {
    try {
        const trimmed = url.trim();
        const formattedUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
        const parsedUrl = new URL(formattedUrl);
        const hostname = parsedUrl.hostname.toLowerCase();

        // 1. Standard Web Domain Verification
        const isDomainLegit = LEGIT_DOMAINS.some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
        );

        if (isDomainLegit && !hostname.includes("instagram.com")) {
            return { status: "LEGIT", message: `Official verified source: ${domainExtract(hostname)}` };
        }

        // 2. Instagram Advanced Verification
        if (hostname.includes("instagram.com")) {
            const pathSegments = parsedUrl.pathname.split("/").filter(s => s.length > 0);

            // Case A: Profile Link
            if (pathSegments.length === 1 && !["p", "reels", "reel", "stories", "tv"].includes(pathSegments[0])) {
                const username = pathSegments[0].toLowerCase();
                if (isWhitelisted(username)) {
                    return { status: "LEGIT", message: `Official Instagram Account: @${username}` };
                }
            }

            // Case B: Content Link (Post, Reel, etc.)
            const shortcode = pathSegments.find((seg, idx) => idx > 0 && pathSegments[idx - 1].match(/p|reels|reel/));
            const embedUrl = shortcode ? `https://www.instagram.com/p/${shortcode}/embed/captioned/` : null;

            const fetchLayers = async (target: string) => {
                try {
                    const response = await fetch(target, {
                        headers: {
                            // Mimic Facebook/Google crawler to get the OG Description with the handle
                            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                        },
                        next: { revalidate: 3600 }
                    });
                    if (!response.ok) return "";
                    return await response.text();
                } catch (e) {
                    return "";
                }
            };

            // Try Embed first (usually cleaner)
            let html = embedUrl ? await fetchLayers(embedUrl) : "";
            let detected = detectHandle(html);

            // Try Main URL if Embed failed
            if (!detected) {
                html = await fetchLayers(formattedUrl);
                detected = detectHandle(html);
            }

            if (detected) {
                return { status: "LEGIT", message: `Verified official content from @${detected}` };
            }
        }

        return { status: "FAKE", message: "Source not found in our official registry." };
    } catch (e) {
        return { status: "ERROR", message: "Invalid or malformed URL." };
    }
}

function detectHandle(html: string): string | null {
    if (!html) return null;

    // Regex 1: The "likes, comments - handle on date" pattern (Found in OG Description)
    // Matches: 935 likes, 38 comments - khaleejtimes on March 5, 2026
    const ogPatternMatch = html.match(/(\d+(?:,\d+)*)\s+likes,\s+(\d+(?:,\d+)*)\s+comments\s+-\s+([a-zA-Z0-9._]+)\s+on/i);

    // Regex 2: Shared post/reel from handle
    const sharedMatch = html.match(/shared (?:a post|a reel) from (?:@)?([a-zA-Z0-9._]+)/i);

    // Regex 3: Embed Username pattern
    const embedMatch = html.match(/class="UsernameText">([a-zA-Z0-9._]+)</i) ||
        html.match(/instagram.com\/([a-zA-Z0-9._]+)\//i);

    // Regex 4: Meta Title/OG Title pattern (often has @handle)
    const metaTitleMatch = html.match(/<title>.*?@([a-zA-Z0-9._]+)/i) ||
        html.match(/property="og:title" content=".*?@([a-zA-Z0-9._]+)/i);

    // Regex 5: JSON data blobs
    const jsonMatch = html.match(/"username":"([a-zA-Z0-9._]+)"/i);

    const candidates = [
        ogPatternMatch ? ogPatternMatch[3] : null,
        sharedMatch ? sharedMatch[1] : null,
        embedMatch ? embedMatch[1] : null,
        metaTitleMatch ? metaTitleMatch[1] : null,
        jsonMatch ? jsonMatch[1] : null
    ].filter(Boolean) as string[];

    for (const username of candidates) {
        const clean = username.split(/[^a-zA-Z0-9._]/)[0].toLowerCase();
        if (clean && INSTAGRAM_WHITELIST.includes(clean)) return clean;
    }

    // fallback: scan the whole HTML for whitelisted handles with "@" or "instagram.com/"
    const lowerHtml = html.toLowerCase();
    for (const handle of INSTAGRAM_WHITELIST) {
        const h = handle.toLowerCase();
        if (lowerHtml.includes(`@${h}`) || lowerHtml.includes(`instagram.com/${h}`)) {
            return h;
        }
    }

    return null;
}

function isWhitelisted(handle: string): boolean {
    return INSTAGRAM_WHITELIST.some(h => h.toLowerCase() === handle.toLowerCase());
}

function domainExtract(hostname: string): string {
    const parts = hostname.split('.');
    return parts.length > 2 ? parts.slice(-2).join('.') : hostname;
}
