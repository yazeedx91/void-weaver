/**
 * Script Loader Utility
 * For loading external payment scripts
 */

export const loadScript = (src, id) => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.getElementById(id)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = () => {
      reject(new Error(`Failed to load script: ${src}`));
    };

    document.head.appendChild(script);
  });
};

export const unloadScript = (id) => {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
};

export const isScriptLoaded = (id) => {
  return !!document.getElementById(id);
};
