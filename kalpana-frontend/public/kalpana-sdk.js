/**
 * Kalpana Timetable Platform SDK
 * Easy integration for college websites
 * Version: 2.0.0
 */

(function (window) {
  "use strict";

  // Configuration
  const DEFAULT_CONFIG = {
    apiBaseUrl: "https://api.kalpana-timetable.com",
    frontendUrl: "https://app.kalpana-timetable.com",
    theme: "light",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    language: "en",
    debug: false,
  };

  // SDK Class
  class KalpanaSDK {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.collegeId = null;
      this.isInitialized = false;
      this.widgets = new Map();

      this.log("SDK initialized with config:", this.config);
    }

    // Initialize SDK with college information
    async init(collegeId, options = {}) {
      try {
        this.collegeId = collegeId;
        this.config = { ...this.config, ...options };

        // Fetch college configuration
        const collegeConfig = await this.fetchCollegeConfig(collegeId);
        if (collegeConfig) {
          this.config = { ...this.config, ...collegeConfig.customization };
        }

        this.isInitialized = true;
        this.log("SDK initialized for college:", collegeId);

        return { success: true, collegeId };
      } catch (error) {
        this.log("Failed to initialize SDK:", error);
        return { success: false, error: error.message };
      }
    }

    // Create embedded timetable widget
    createTimetableWidget(containerId, options = {}) {
      if (!this.isInitialized) {
        throw new Error("SDK not initialized. Call init() first.");
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id "${containerId}" not found.`);
      }

      const widgetId = `kalpana-widget-${Date.now()}`;
      const widgetConfig = {
        collegeId: this.collegeId,
        type: "timetable",
        theme: this.config.theme,
        primaryColor: this.config.primaryColor,
        secondaryColor: this.config.secondaryColor,
        language: this.config.language,
        ...options,
      };

      // Create iframe
      const iframe = document.createElement("iframe");
      iframe.id = widgetId;
      iframe.src = `${this.config.frontendUrl}/embed/${
        this.collegeId
      }?${this.buildQueryString(widgetConfig)}`;
      iframe.style.width = "100%";
      iframe.style.height = "600px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.allow = "fullscreen";

      // Add loading state
      const loadingDiv = document.createElement("div");
      loadingDiv.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          background: linear-gradient(135deg, ${this.config.primaryColor}, ${this.config.secondaryColor});
          color: white;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          <div style="text-align: center;">
            <div style="
              width: 40px;
              height: 40px;
              border: 3px solid rgba(255,255,255,0.3);
              border-top: 3px solid white;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            "></div>
            <div>Loading Timetable...</div>
          </div>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      container.appendChild(loadingDiv);

      // Handle iframe load
      iframe.onload = () => {
        container.removeChild(loadingDiv);
        container.appendChild(iframe);
        this.log("Timetable widget loaded");
      };

      iframe.onerror = () => {
        container.removeChild(loadingDiv);
        container.innerHTML = `
          <div style="
            padding: 20px;
            text-align: center;
            color: #666;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <h3>Unable to load timetable</h3>
            <p>Please try again later or contact support.</p>
          </div>
        `;
      };

      this.widgets.set(widgetId, {
        type: "timetable",
        container,
        iframe,
        config: widgetConfig,
      });

      return widgetId;
    }

    // Create faculty schedule widget
    createFacultyWidget(containerId, facultyId, options = {}) {
      if (!this.isInitialized) {
        throw new Error("SDK not initialized. Call init() first.");
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id "${containerId}" not found.`);
      }

      const widgetId = `kalpana-faculty-${Date.now()}`;
      const widgetConfig = {
        collegeId: this.collegeId,
        facultyId: facultyId,
        type: "faculty-schedule",
        theme: this.config.theme,
        primaryColor: this.config.primaryColor,
        secondaryColor: this.config.secondaryColor,
        language: this.config.language,
        ...options,
      };

      // Create iframe for faculty schedule
      const iframe = document.createElement("iframe");
      iframe.id = widgetId;
      iframe.src = `${this.config.frontendUrl}/embed/${
        this.collegeId
      }/faculty/${facultyId}?${this.buildQueryString(widgetConfig)}`;
      iframe.style.width = "100%";
      iframe.style.height = "400px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.allow = "fullscreen";

      container.appendChild(iframe);

      this.widgets.set(widgetId, {
        type: "faculty-schedule",
        container,
        iframe,
        config: widgetConfig,
      });

      return widgetId;
    }

    // Create student schedule widget
    createStudentWidget(containerId, studentId, options = {}) {
      if (!this.isInitialized) {
        throw new Error("SDK not initialized. Call init() first.");
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id "${containerId}" not found.`);
      }

      const widgetId = `kalpana-student-${Date.now()}`;
      const widgetConfig = {
        collegeId: this.collegeId,
        studentId: studentId,
        type: "student-schedule",
        theme: this.config.theme,
        primaryColor: this.config.primaryColor,
        secondaryColor: this.config.secondaryColor,
        language: this.config.language,
        ...options,
      };

      // Create iframe for student schedule
      const iframe = document.createElement("iframe");
      iframe.id = widgetId;
      iframe.src = `${this.config.frontendUrl}/embed/${
        this.collegeId
      }/student/${studentId}?${this.buildQueryString(widgetConfig)}`;
      iframe.style.width = "100%";
      iframe.style.height = "400px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.allow = "fullscreen";

      container.appendChild(iframe);

      this.widgets.set(widgetId, {
        type: "student-schedule",
        container,
        iframe,
        config: widgetConfig,
      });

      return widgetId;
    }

    // Create login widget
    createLoginWidget(containerId, options = {}) {
      if (!this.isInitialized) {
        throw new Error("SDK not initialized. Call init() first.");
      }

      const container = document.getElementById(containerId);
      if (!container) {
        throw new Error(`Container with id "${containerId}" not found.`);
      }

      const widgetId = `kalpana-login-${Date.now()}`;
      const widgetConfig = {
        collegeId: this.collegeId,
        type: "login",
        theme: this.config.theme,
        primaryColor: this.config.primaryColor,
        secondaryColor: this.config.secondaryColor,
        language: this.config.language,
        ...options,
      };

      // Create iframe for login
      const iframe = document.createElement("iframe");
      iframe.id = widgetId;
      iframe.src = `${this.config.frontendUrl}/embed/${
        this.collegeId
      }/login?${this.buildQueryString(widgetConfig)}`;
      iframe.style.width = "100%";
      iframe.style.height = "500px";
      iframe.style.border = "none";
      iframe.style.borderRadius = "8px";
      iframe.allow = "fullscreen";

      container.appendChild(iframe);

      this.widgets.set(widgetId, {
        type: "login",
        container,
        iframe,
        config: widgetConfig,
      });

      return widgetId;
    }

    // Update widget configuration
    updateWidget(widgetId, newConfig) {
      const widget = this.widgets.get(widgetId);
      if (!widget) {
        throw new Error(`Widget with id "${widgetId}" not found.`);
      }

      widget.config = { ...widget.config, ...newConfig };

      // Rebuild iframe with new config
      const newSrc = `${this.config.frontendUrl}/embed/${
        this.collegeId
      }?${this.buildQueryString(widget.config)}`;
      widget.iframe.src = newSrc;

      this.log("Widget updated:", widgetId);
    }

    // Remove widget
    removeWidget(widgetId) {
      const widget = this.widgets.get(widgetId);
      if (!widget) {
        throw new Error(`Widget with id "${widgetId}" not found.`);
      }

      widget.container.removeChild(widget.iframe);
      this.widgets.delete(widgetId);

      this.log("Widget removed:", widgetId);
    }

    // Get college information
    async getCollegeInfo() {
      if (!this.isInitialized) {
        throw new Error("SDK not initialized. Call init() first.");
      }

      try {
        const response = await fetch(
          `${this.config.apiBaseUrl}/api/colleges/info?collegeId=${this.collegeId}`
        );
        const data = await response.json();
        return data;
      } catch (error) {
        this.log("Failed to get college info:", error);
        return { success: false, error: error.message };
      }
    }

    // Get timetable data
    async getTimetableData(timetableId = null) {
      if (!this.isInitialized) {
        throw new Error("SDK not initialized. Call init() first.");
      }

      try {
        let url = `${this.config.apiBaseUrl}/api/colleges/timetables?collegeId=${this.collegeId}`;
        if (timetableId) {
          url += `&timetableId=${timetableId}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        return data;
      } catch (error) {
        this.log("Failed to get timetable data:", error);
        return { success: false, error: error.message };
      }
    }

    // Helper methods
    async fetchCollegeConfig(collegeId) {
      try {
        const response = await fetch(
          `${this.config.apiBaseUrl}/api/colleges/embed/config?collegeId=${collegeId}`
        );
        const data = await response.json();
        return data.success ? data.data : null;
      } catch (error) {
        this.log("Failed to fetch college config:", error);
        return null;
      }
    }

    buildQueryString(config) {
      return Object.keys(config)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(config[key])}`
        )
        .join("&");
    }

    log(message, ...args) {
      if (this.config.debug) {
        console.log(`[KalpanaSDK] ${message}`, ...args);
      }
    }
  }

  // Auto-initialize if data attributes are present
  document.addEventListener("DOMContentLoaded", function () {
    const containers = document.querySelectorAll("[data-kalpana-widget]");
    containers.forEach((container) => {
      const collegeId = container.getAttribute("data-college-id");
      const widgetType = container.getAttribute("data-kalpana-widget");
      const options = JSON.parse(
        container.getAttribute("data-options") || "{}"
      );

      if (collegeId && widgetType) {
        const sdk = new KalpanaSDK();
        sdk.init(collegeId, options).then(() => {
          switch (widgetType) {
            case "timetable":
              sdk.createTimetableWidget(container.id, options);
              break;
            case "faculty":
              const facultyId = container.getAttribute("data-faculty-id");
              if (facultyId) {
                sdk.createFacultyWidget(container.id, facultyId, options);
              }
              break;
            case "student":
              const studentId = container.getAttribute("data-student-id");
              if (studentId) {
                sdk.createStudentWidget(container.id, studentId, options);
              }
              break;
            case "login":
              sdk.createLoginWidget(container.id, options);
              break;
          }
        });
      }
    });
  });

  // Export to global scope
  window.KalpanaSDK = KalpanaSDK;

  // Also create a global instance for convenience
  window.kalpana = new KalpanaSDK();
})(window);
