import type { Ref } from 'vue';
import { computed, ref } from 'vue';

export function useAudioControl(audioRef: Ref<HTMLAudioElement | null>, onEnded: () => void) {
  const audioCurrentTime = ref(0);
  const audioDuration = ref(0);
  const audioVolume = ref(1);
  const isMuted = ref(false);
  const prevVolume = ref(1);

  const progressPercent = computed(() =>
    audioDuration.value > 0 ? (audioCurrentTime.value / audioDuration.value) * 100 : 0,
  );

  function onAudioTimeUpdate() {
    if (audioRef.value) audioCurrentTime.value = audioRef.value.currentTime;
  }

  function onAudioDurationChange() {
    if (audioRef.value) audioDuration.value = audioRef.value.duration;
  }

  function onAudioVolumeChange() {
    if (audioRef.value) {
      audioVolume.value = audioRef.value.volume;
      isMuted.value = audioRef.value.muted;
    }
  }

  function onAudioEnded() {
    onEnded();
  }

  function seekAudio(event: Event) {
    const input = event.target as HTMLInputElement;
    if (audioRef.value) {
      audioRef.value.currentTime = Number(input.value);
    }
  }

  function setVolume(val: number | undefined) {
    if (val === undefined) return;
    if (audioRef.value) {
      audioRef.value.volume = val;
      audioVolume.value = val;
      if (val > 0) {
        audioRef.value.muted = false;
        isMuted.value = false;
      }
    }
  }

  function toggleMute() {
    if (audioRef.value) {
      if (isMuted.value) {
        audioRef.value.muted = false;
        isMuted.value = false;
        if (audioVolume.value === 0) {
          const nextVol = prevVolume.value > 0 ? prevVolume.value : 1;
          audioRef.value.volume = nextVol;
          audioVolume.value = nextVol;
        }
      } else {
        prevVolume.value = audioVolume.value;
        audioRef.value.muted = true;
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
