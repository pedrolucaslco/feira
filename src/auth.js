window.FeiraAuth = (function () {
  var supabase = null;
  var session = null;
  var listeners = [];
  var initialized = false;

  var GUEST_KEY = "feira:guest-mode";
  var SESSION_CHECKED_KEY = "feira:session-checked";

  function isGuestMode() {
    return localStorage.getItem(GUEST_KEY) === "true";
  }

  function setGuestMode(enabled) {
    if (enabled) {
      localStorage.setItem(GUEST_KEY, "true");
    } else {
      localStorage.removeItem(GUEST_KEY);
    }
  }

  function client() {
    if (supabase) return supabase;
    if (!window.FEIRA_SUPABASE || !window.FEIRA_SUPABASE.url || !window.FEIRA_SUPABASE.anonKey || !window.supabase) {
      return null;
    }
    supabase = window.supabase.createClient(window.FEIRA_SUPABASE.url, window.FEIRA_SUPABASE.anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    return supabase;
  }

  function notify() {
    var s = session;
    listeners.forEach(function (fn) { try { fn(s); } catch (_) {} });
  }

  function onAuthStateChange(fn) {
    listeners.push(fn);
    if (initialized && session !== undefined) {
      try { fn(session); } catch (_) {}
    }
    return function () {
      listeners = listeners.filter(function (f) { return f !== fn; });
    };
  }

  async function init() {
    var c = client();
    if (!c) {
      initialized = true;
      session = null;
      notify();
      return null;
    }

    try {
      var result = await c.auth.getSession();
      session = result.data.session || null;
    } catch (_) {
      session = null;
    }

    c.auth.onAuthStateChange(function (event, s) {
      session = s;
      if (!s) {
        localStorage.removeItem(SESSION_CHECKED_KEY);
      }
      notify();
    });

    initialized = true;
    notify();
    return session;
  }

  async function signIn(email, password) {
    var c = client();
    if (!c) return { error: new Error("Supabase não configurado") };
    localStorage.removeItem(GUEST_KEY);
    var result = await c.auth.signInWithPassword({ email: email, password: password });
    if (!result.error) {
      session = result.data.session;
      notify();
    }
    return result;
  }

  async function signUp(email, password) {
    var c = client();
    if (!c) return { error: new Error("Supabase não configurado") };
    localStorage.removeItem(GUEST_KEY);
    var result = await c.auth.signUp({ email: email, password: password });
    if (!result.error && result.data.session) {
      session = result.data.session;
      notify();
    }
    return result;
  }

  async function signInWithGoogle() {
    var c = client();
    if (!c) return { error: new Error("Supabase não configurado") };
    localStorage.removeItem(GUEST_KEY);
    var redirectTo = window.location.origin + "/app/lista";
    return await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo } });
  }

  async function sendMagicLink(email) {
    var c = client();
    if (!c) return { error: new Error("Supabase não configurado") };
    localStorage.removeItem(GUEST_KEY);
    var redirectTo = window.location.origin + "/app/lista";
    return await c.auth.signInWithOtp({ email: email, options: { shouldCreateUser: true, emailRedirectTo: redirectTo } });
  }

  async function signOut() {
    var c = client();
    if (!c) return;
    await c.auth.signOut();
    session = null;
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(SESSION_CHECKED_KEY);
    notify();
  }

  async function continueAsGuest() {
    setGuestMode(true);
    var c = client();
    if (!c) return null;
    try {
      var result = await c.auth.signInAnonymously();
      if (!result.error) {
        session = result.data.session;
        notify();
      }
    } catch (_) {}
    return session;
  }

  function getSession() {
    return session;
  }

  function isAuthenticated() {
    return Boolean(session && session.user && !session.user.is_anonymous);
  }

  function isLoggedIn() {
    return Boolean(session) || isGuestMode();
  }

  async function ensureSession() {
    if (session) return session;
    if (isGuestMode()) return null;

    var c = client();
    if (!c) {
      setGuestMode(true);
      return null;
    }

    try {
      var result = await c.auth.signInAnonymously();
      if (!result.error) {
        session = result.data.session;
        notify();
      } else {
        setGuestMode(true);
      }
    } catch (_) {
      setGuestMode(true);
    }
    return session;
  }

  return {
    init: init,
    signIn: signIn,
    signUp: signUp,
    signInWithGoogle: signInWithGoogle,
    sendMagicLink: sendMagicLink,
    signOut: signOut,
    continueAsGuest: continueAsGuest,
    getSession: getSession,
    isAuthenticated: isAuthenticated,
    isLoggedIn: isLoggedIn,
    isGuestMode: isGuestMode,
    ensureSession: ensureSession,
    onAuthStateChange: onAuthStateChange,
  };
})();
