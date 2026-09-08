"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import LogoLoader from "./LogoLoader";

const MIN_DISPLAY_MS = 550;
const MAX_DISPLAY_MS = 10000;

/**
 * Shows a branded loading screen while the user navigates between pages.
 * Detects navigations three ways so every client-side route change is covered:
 *  1. capture-phase clicks on internal <a> links (Next <Link>),
 *  2. history.pushState/replaceState patches (router.push, form redirects),
 *  3. popstate (browser back/forward).
 * Hides once the URL reaches the pending target (or any new URL for popstate),
 * keeping the loader visible for a minimum duration so it reads as intentional.
 */
export default function PageTransitionLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const targetRef = useRef<string | null>(null);
  const startTimeRef = useRef(0);
  const failSafeRef = useRef<number | null>(null);

  const currentUrl = `${pathname}${searchParams ? `?${searchParams.toString()}` : ""}`;

  const showLoader = useCallback((target?: string | null) => {
    targetRef.current = target ?? null;
    startTimeRef.current = Date.now();
    // Defer the state update out of the current call stack. The navigation
    // click/pushState can execute inside React's transition or
    // insertion-effect phases, where a synchronous setState (flushSync)
    // throws "useInsertionEffect must not schedule updates". A microtask
    // escapes that scope; the update then runs as a normal urgent render
    // before the next paint, so the loader still appears instantly.
    queueMicrotask(() => setLoading(true));
    if (failSafeRef.current) window.clearTimeout(failSafeRef.current);
    failSafeRef.current = window.setTimeout(() => setLoading(false), MAX_DISPLAY_MS);
  }, []);

  // Hide once the URL has reached the pending target (any URL when target unknown)
  useEffect(() => {
    if (!loading) return;
    const target = targetRef.current;
    const reached = target === null || currentUrl === target;
    if (!reached) return;
    const elapsed = Date.now() - startTimeRef.current;
    const delay = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const t = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(t);
  }, [loading, currentUrl]);

  useEffect(() => {
    const isInternal = (url: string | URL | null | undefined) => {
      if (url == null || typeof url !== "string") return true;
      try {
        return new URL(url, window.location.origin).origin === window.location.origin;
      } catch {
        return true;
      }
    };
    const normalize = (url: string | URL | null | undefined) => {
      if (url == null) return null;
      try {
        const u = new URL(url.toString(), window.location.origin);
        return u.pathname + u.search;
      } catch {
        return typeof url === "string" ? url : null;
      }
    };

    // 1. Patch history methods (covers router.push, login redirects, form navigations)
    const origPush = window.history.pushState;
    const origReplace = window.history.replaceState;
    window.history.pushState = function (this: History, state, title, url) {
      const result = origPush.call(this, state, title, url);
      if (isInternal(url)) showLoader(normalize(url));
      return result;
    };
    window.history.replaceState = function (this: History, state, title, url) {
      const result = origReplace.call(this, state, title, url);
      if (isInternal(url)) showLoader(normalize(url));
      return result;
    };

    // 2. Back/forward navigation
    const onPopState = () => showLoader(null);
    window.addEventListener("popstate", onPopState);

    // 3. Capture-phase click on internal anchors (fires before the router navigates)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      const url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      const target = url.pathname + url.search;
      if (target === window.location.pathname + window.location.search) return;
      showLoader(target);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.history.pushState = origPush;
      window.history.replaceState = origReplace;
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
      if (failSafeRef.current) window.clearTimeout(failSafeRef.current);
    };
  }, [showLoader]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] bg-cream flex items-center justify-center"
          role="status"
          aria-label="Loading page"
        >
          <LogoLoader />
        </motion.div>
      )}
    </AnimatePresence>
  );
}