// NOTE: We are intentionally NOT importing 'tone' at the top level.

// Define the sound names and their file paths
const soundFiles = {
  start: '/sounds/start.mp3',
  end: '/sounds/end.mp3',
  countdown: '/sounds/countdown.mp3',
};

class AudioService {
  constructor() {
    this.Tone = null; // This will hold the dynamically imported Tone.js module
    this.players = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  // The init function now dynamically imports Tone.js on the first call.
  init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      try {
        const ToneModule = await import('tone');
        this.Tone = ToneModule;

        await this.Tone.start();
        console.log("Audio context started successfully after user gesture.");

        // Create the players. The promise will resolve ONLY in the onload callback.
        this.players = new this.Tone.Players(soundFiles, () => {
          console.log("All audio files have finished loading.");
          
          // --- KEY FIX #1: Ensure the master clock (Transport) is running ---
          // This is a crucial step for scheduling and reliable playback.
          if (this.Tone.Transport.state !== 'started') {
            this.Tone.Transport.start();
            console.log("Tone.Transport started.");
          }

          this.isInitialized = true;
          resolve(); // Resolve the promise now that everything is truly ready.
        }).toDestination();

      } catch (error) {
        console.error("Error initializing or loading Tone.js:", error);
        reject(error);
      }
    });

    return this.initPromise;
  }

  play(soundName) {
    if (!this.isInitialized || !this.players) {
      console.warn(`[AudioService] PLAY CANCELED: Service not ready.`);
      return;
    }

    const player = this.players.player(soundName);

    if (player && player.loaded) {
      // --- KEY FIX #2: Ensure connection and start ---
      // This is the most reliable way to play a sound, preventing silent failures.
      player.toDestination().start();
      console.log(`[AudioService] SUCCESS: player.start() called for "${soundName}".`);
    } else {
      console.error(`[AudioService] PLAY FAILED: Player for "${soundName}" was not found or not loaded.`);
    }
  }
}

// Export a singleton instance of the service
const audioService = new AudioService();
export default audioService;
