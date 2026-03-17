import type { Ref } from 'vue';
import { computed, ref } from 'vue';

export function useAudioControl(audioElement: Ref<HTMLAudioElement | null>, onEnded: () => void) {
  const audioCurrentTime = ref(0);
  const audioDuration = ref(0);
  const audioVolume = ref(1);
  const isMuted = ref(false);
  const prevVolume = ref(1);

  const progressPercent = computed(() =>
    audioDuration.value > 0 ? (audioCurrentTime.value / audioDuration.value) * 100 : 0,
  );

  function onAudioTimeUpdate() {
    if (audioElement.value) audioCurrentTime.value = audioElement.value.currentTime;
  }

  function onAudioDurationChange() {
    if (audioElement.value) audioDuration.value = audioElement.value.duration;
  }

  function onAudioVolumeChange() {
    if (audioElement.value) {
      audioVolume.value = audioElement.value.volume;
      isMuted.value = audioElement.value.muted;
    }
  }

  function onAudioEnded() {
    onEnded();
  }

  function seekAudio(event: Event) {
    const input = event.target as HTMLInputElement;
    if (audioElement.value) {
      audioElement.value.currentTime = Number(input.value);
    }
  }

  function setVolume(val: number | undefined) {
    if (val === undefined) return;
    if (audioElement.value) {
      audioElement.value.volume = val;
      audioVolume.value = val;
      if (val > 0) {
        audioElement.value.muted = false;
        isMuted.value = false;
      }
    }
  }

  function toggleMute() {
    if (audioElement.value) {
      if (isMuted.value) {
        audioElement.value.muted = false;
        isMuted.value = false;
        if (audioVolume.value === 0) {
          const nextVol = prevVolume.value > 0 ? prevVolume.value : 1;
          audioElement.value.volume = nextVol;
          audioVolume.value = nextVol;
        }
      } else {
        prevVolume.value = audioVolume.value;
        audioElement.value.muted = true;
        isMuted.value = true;
      }
    }
  }

  function formatTime(seconds: number) {
    if (!isFinite(seconds)) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return {
    audioCurrentTime,
    audioDuration,
    audioVolume,
    isMuted,
    progressPercent,
    onAudioTimeUpdate,
    onAudioDurationChange,
    onAudioVolumeChange,
    onAudioEnded,
    seekAudio,
    setVolume,
    toggleMute,
    formatTime,
  };
}
