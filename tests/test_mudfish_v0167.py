"""v0.16.7: flags de tela cheia dinâmicas por navegador no atalho do painel."""
import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import mudfish_mgr  # noqa: E402

URL = "http://127.0.0.1:8282"
CHROMIUM_TAIL = "--ozone-platform-hint=auto --new-window --start-fullscreen --window-size=1280,800 " + URL


def opts(argv, browser):
    return mudfish_mgr.launch_spec(argv, browser)["launch_options"]


class GeckoTests(unittest.TestCase):
    def test_firefox_flatpak(self):
        self.assertEqual(opts(["/usr/bin/flatpak", "run", "org.mozilla.firefox"], "firefox"), "run org.mozilla.firefox --kiosk " + URL)

    def test_firefox_native(self):
        self.assertEqual(opts(["/usr/bin/firefox"], "firefox"), "--kiosk " + URL)

    def test_gecko_derivative_unknown_id_detected_by_exe(self):
        self.assertEqual(opts(["/usr/bin/librewolf"], "librewolf"), "--kiosk " + URL)


class ChromiumTests(unittest.TestCase):
    def test_all_catalog_ids_native(self):
        for bid in mudfish_mgr.CHROMIUM_IDS:
            self.assertEqual(opts(["/usr/bin/" + bid], bid), CHROMIUM_TAIL, bid)

    def test_flatpak_flags_after_app_id_and_before_url(self):
        apps = {"chrome": "com.google.Chrome", "edge": "com.microsoft.Edge", "brave": "com.brave.Browser",
                "chromium": "org.chromium.Chromium", "opera": "com.opera.Opera", "vivaldi": "com.vivaldi.Vivaldi"}
        for bid, app in apps.items():
            self.assertEqual(opts(["/usr/bin/flatpak", "run", app], bid), "run %s %s" % (app, CHROMIUM_TAIL), bid)

    def test_chromium_derivative_detected_by_exe(self):
        self.assertEqual(opts(["/opt/thorium/thorium-browser"], "thorium"), CHROMIUM_TAIL)


class FallbackTests(unittest.TestCase):
    def test_unknown_browser_only_url(self):
        self.assertEqual(opts(["/usr/bin/falkon"], "falkon"), URL)
        self.assertEqual(opts(["/usr/bin/flatpak", "run", "org.example.Browser"], None), "run org.example.Browser " + URL)

    def test_family(self):
        self.assertEqual(mudfish_mgr.browser_family("firefox"), "gecko")
        self.assertEqual(mudfish_mgr.browser_family("brave"), "chromium")
        self.assertEqual(mudfish_mgr.browser_family("x", ["/usr/bin/x"]), "")


class SignatureTests(unittest.TestCase):
    def test_sig_depends_on_flags_so_old_shortcut_is_replaced(self):
        argv = ["/usr/bin/firefox"]
        old = mudfish_mgr.launch_spec(argv, "firefox")["sig"]
        self.assertEqual(old, mudfish_mgr.launch_spec(argv, "firefox")["sig"])
        import hashlib
        legacy = hashlib.sha1(("%s\0%s" % ("/usr/bin/firefox", URL)).encode()).hexdigest()[:16]
        self.assertNotEqual(old, legacy)

    def test_direct_launch_flags_unchanged(self):
        self.assertEqual(mudfish_mgr.browser_flags("firefox"), [])
        self.assertEqual(mudfish_mgr.browser_flags("chrome"), list(mudfish_mgr.CHROMIUM_FLAGS))


if __name__ == "__main__":
    unittest.main()
