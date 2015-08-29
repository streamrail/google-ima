Polymer({

  is: 'google-ima',

  properties: {

    /**
     * autoplay video and ad or not
     */
    autoplay: Boolean,

    /**
     * Content video sources. An array of sources containing src/type pairs. 
     *
     * @type Array of {{src: string, type: string}}
     */
    sources: {
      type: Array,
    },
    /**
     * The ad tag url used in the ads request
     */
    adtagurl: String,
    /**
     * Specify the linear and nonlinear slot sizes. This helps the SDK to select the correct creative if multiple are returned.
     */
    linearadslotWidth: Number,
    /**
     * Specify the linear and nonlinear slot sizes. This helps the SDK to select the correct creative if multiple are returned.
     */
    linearadslotHeight: Number,
    /**
     * Specify the linear and nonlinear slot sizes. This helps the SDK to select the correct creative if multiple are returned.
     */
    nonLinearadslotWidth: Number,
    /**
     * Specify the linear and nonlinear slot sizes. This helps the SDK to select the correct creative if multiple are returned.
     */
    nonLinearadslotHeight: Number,

  },

  // Element Lifecycle

  ready: function() {},

  attached: function() {
    var _self = this;
    var adsManager;
    var adsLoader;
    var adDisplayContainer;
    var intervalTimer;
    var videoContent;
    videoContent = document.getElementById('contentElement');

    function createAdDisplayContainer() {
      // We assume the adContainer is the DOM id of the element that will house
      // the ads.
      adDisplayContainer =
        new google.ima.AdDisplayContainer(
          document.getElementById('adContainer'), videoContent);
    }

    function requestAds() {
      // Create the ad display container.
      createAdDisplayContainer();
      // Initialize the container. Must be done via a user action on mobile devices.
      adDisplayContainer.initialize();
      videoContent.load();
      // Create ads loader.
      adsLoader = new google.ima.AdsLoader(adDisplayContainer);
      // Listen and respond to ads loaded and error events.
      adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded,
        false);
      adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false);

      // Request video ads.
      var adsRequest = new google.ima.AdsRequest();
      adsRequest.adTagUrl = _self.adtagurl;

      adsRequest.linearAdSlotWidth = _self.linearadslotwidth;
      adsRequest.linearAdSlotHeight = _self.linearadslotheight;

      adsRequest.nonLinearAdSlotWidth = _self.nonlinearadslotwidth;
      adsRequest.nonLinearAdSlotHeight = _self.nonlinearadslotheight;

      adsLoader.requestAds(adsRequest);
    }

    function onAdsManagerLoaded(adsManagerLoadedEvent) {
      // Get the ads manager.

      var adsRenderingSettings = new google.ima.AdsRenderingSettings();
      adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
      // videoContent should be set to the content video element.
      _self.adsManager = adsManager = adsManagerLoadedEvent.getAdsManager(
        videoContent, adsRenderingSettings);

      _self.fire('google-ima-adsmanager-loaded', {
        adsManager: adsManager
      })

      // Add listeners to the required events.
      adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError);
      adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested);
      adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested);
      adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        onAdEvent);

      // Listen to any additional events, if necessary.
      adsManager.addEventListener(
        google.ima.AdEvent.Type.LOADED,
        onAdEvent);
      adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        onAdEvent);
      adsManager.addEventListener(
        google.ima.AdEvent.Type.COMPLETE,
        onAdEvent);

      try {
        // Initialize the ads manager. Ad rules playlist will start at this time.
        adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
        // Call play to start showing the ad. Single video and overlay ads will
        // start at this time; the call will be ignored for ad rules.
        adsManager.start();
      } catch (adError) {
        // An error may be thrown if there was a problem with the VAST response.
        videoContent.play();
      }
    }

    function onAdEvent(adEvent) {
      // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
      // don't have ad object associated.
      var ad = adEvent.getAd();
      _self.fire('google-ima-ad-event', {
        ad: ad
      });
      switch (adEvent.type) {
        case google.ima.AdEvent.Type.LOADED:
          // This is the first event sent for an ad - it is possible to
          // determine whether the ad is a video ad or an overlay.
          if (!ad.isLinear()) {
            // Position AdDisplayContainer correctly for overlay.
            // Use ad.width and ad.height.
            videoContent.play();
          }
          break;
        case google.ima.AdEvent.Type.STARTED:
          // This event indicates the ad has started - the video player
          // can adjust the UI, for example display a pause button and
          // remaining time.
          if (ad.isLinear()) {
            // For a linear ad, a timer can be started to poll for
            // the remaining time.
            intervalTimer = setInterval(
              function() {
                var remainingTime = adsManager.getRemainingTime();
              },
              300); // every 300ms
          }
          break;
        case google.ima.AdEvent.Type.COMPLETE:
          // This event indicates the ad has finished - the video player
          // can perform appropriate UI actions, such as removing the timer for
          // remaining time detection.
          if (ad.isLinear()) {
            clearInterval(intervalTimer);
          }
          break;
      }
    }

    function onAdError(adErrorEvent) {
      _self.fire('google-ima-error', {
        error: adErrorEvent.getError()
      });
      adsManager.destroy();
    }

    function onContentPauseRequested() {
      // This function is where you should setup UI for showing ads (e.g.
      // display ad timer countdown, disable seeking etc.)
      _self.fire('google-ima-content-event', {
        type: 'pause-requested'
      });
      videoContent.pause();
    }

    function onContentResumeRequested() {
      // This function is where you should ensure that your UI is ready
      // to play content. It is the responsibility of the Publisher to
      // implement this function when necessary.
      // setupUIForContent();
      _self.fire('google-ima-content-event', {
        type: 'resume-requested'
      });
      videoContent.play();
    }

    if (this.autoplay) {
      requestAds();
    }
  },

  detached: function() {
    // The analog to `attached`, `detached` fires when the element has been
    // removed from a document.
    //
    // Use this to clean up anything you did in `attached`.
  },

  // Element Behavior

  /**
   * The `google-ima-content-event` event is fired whenever a content event is fired by the IMA adsManager.
   * for example: `CONTENT_RESUME_REQUESTED` or `CONTENT_PAUSE_REQUESTED`
   *
   * @event google-ima-content-event
   * @detail {{type: String}}
   */

  /**
   * The `google-ima-ads-event` event is fired whenever an ads event is fired by the IMA adsManager.
   * for example: `LOADED`, `STARTED`, `COMPLETE`, `ALL_ADS_COMPLETED`
   *
   * @event google-ima-content-event
   * @detail {{type: Object}}
   */

  /**
   * The `google-ima-ads-error` event is fired whenever an ads error is fired by the IMA adsManager.
   *
   * @event google-ima-content-event
   * @detail {{type: String}}
   */

  /**
   * Get the video element (content)
   *
   * @return {VidoeElement} the video tag related to the content
   */
  contentElement: function() {
    return document.getElementById('contentElement');
  },

  /**
   * Get the IMA ads manager, if it has been created already (otherwise this will be null)
   *
   * @return {AdsManaer} IMA Ads Manager Instance
   */
  adsManager: function() {
    return this.adsManager;
  }
});