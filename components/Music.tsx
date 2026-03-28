"use client";

import { AudioWaveform, CircleChevronLeft, CircleChevronRight, Ellipsis, PauseIcon, PlayIcon, Repeat, Star } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react';

const Music = () => {

    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    // track time
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [lyrics, setLyrics] = useState<{ time: number, text: string }[]>([]);

    const lyricRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setCurrentTime(audioRef.current?.currentTime || 0);
                setTimeLeft((audioRef.current?.duration || 0) - (audioRef.current?.currentTime || 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isPlaying])

    const playMusic = () => {
        audioRef.current?.play();
        setIsPlaying(true);
    };

    const pauseMusic = () => {
        audioRef.current?.pause();
        setIsPlaying(false);
    };

    function identifyClicks(second: number) {
        if (!audioRef.current) return
        setCurrentTime(second);
        setTimeLeft((audioRef.current?.duration || 0) - second);
        audioRef.current.currentTime = second;
        playMusic();
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === ' ') {
                isPlaying ? pauseMusic() : playMusic()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isPlaying])

    const renderTimerInFormat = useMemo(() => {
        const minute = Math.floor(timeLeft / 60);
        const second = Math.floor(timeLeft % 60);
        return (
            <>-{minute}:{second}</>
        )
    }, [timeLeft])

    const renderCurrentTimeInFormat = useMemo(() => {
        const minute = Math.floor(currentTime / 60);
        const second = Math.floor(currentTime % 60);
        return (
            <>{minute}:{second}</>
        )
    }, [currentTime])

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/lyrics");
            const data = await res.json();
            if (data) {
                console.log(data.data)
                setLyrics(data.data);
            }
        })()
    }, [])

    const currentLyricIndex = lyrics.findIndex((lyr, ind) => {
        const start = lyr.time;
        const end = lyrics[ind + 1]?.time ?? duration;
        return currentTime >= start && currentTime <= end;
    });

    useEffect(() => {
        if (currentLyricIndex === -1) return;

        const el = lyricRefs.current[currentLyricIndex];
        if (el) {
            el.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [currentLyricIndex]);

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 bg-gradient-to-br from-[#525251] to-[#696867] backdrop-blur-xl bg-opacity-60 max-w-[768px] px-6 py-10 w-full max-h-[500px] h-full bg-[#535352] rounded-2xl'>
            <div className='flex flex-col items-center justify-between gap-15 w-full h-full'>
                <div className={`p-2 bg-[#bdc2c5] rounded-md w-max duration-300 transition-all ease-in-out h-max ${isPlaying ? 'scale-105' : 'scale-75'}`}>
                    <img alt='poster' src='/Rasputin Song Poster.jpeg' />
                </div>
                <div className='flex flex-col gap-2'>
                    <div className='flex gap-4 items-center justify-between'>
                        <div>
                            <h3 className='font-semibold text-[#fefffe]'>Rasputin</h3>
                            <p className='text-[#bcbdba]'>Boney M. - The Essential Boney M.</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <div className='bg-[#777675] rounded-full p-1 w-max h-max'>
                                <Star color='white' size={20} />
                            </div>
                            <div className='bg-[#777675] rounded-full p-1 w-max h-max'>
                                <Ellipsis color='white' size={20} />
                            </div>
                        </div>
                    </div>
                    <audio
                        onLoadedMetadata={() => {
                            const audio = audioRef.current;
                            if (!audio) return;

                            setDuration(audio.duration);
                            setTimeLeft(audio.duration);
                        }}
                        className='hidden' onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => setIsPlaying(false)} ref={audioRef} src="/Rasputin.mp3"
                    />
                    <div className='relative w-full'>
                        <div style={{
                            width: `${(currentTime / duration) * 100}%`,
                            gridTemplateColumns: `repeat(${Math.floor(currentTime)}, minmax(0, 1fr))`
                        }} className={`bg-[#fefffe] grid absolute rounded-2xl p-1 h-2`}>
                            {
                                Array.from({ length: Math.floor(currentTime) }, (_, second) => (
                                    <div
                                        key={second}
                                        onClick={() => identifyClicks(second)}
                                        className="h-2 w-full"
                                    />
                                ))
                            }
                        </div>
                        <div
                            className="w-full bg-[#828280] grid rounded-2xl p-1 h-2"
                            style={{
                                gridTemplateColumns: `repeat(${Math.floor(duration)}, minmax(0, 1fr))`
                            }}
                        >
                            {
                                Array.from({ length: Math.floor(duration) }, (_, second) => (
                                    <div
                                        key={second}
                                        onClick={() => identifyClicks(second)}
                                        className="h-2 w-full"
                                    />
                                ))
                            }
                        </div>
                    </div>
                    <div className='flex justify-between'>
                        <p className='font-semibold text-[#ddddd7] text-[12px]' >{renderCurrentTimeInFormat}</p>
                        <p className='font-semibold text-[#ddddd7] text-[12px]' >{renderTimerInFormat}</p>
                    </div>
                    <div className='flex items-center justify-between'>
                        <AudioWaveform color='#aeafac' size={20} />
                        <div className='flex items-center justify-center gap-2'>
                            <CircleChevronLeft color='#e5e5e5' size={25} />
                            <div onClick={isPlaying ? pauseMusic : playMusic}>
                                {isPlaying ? <PauseIcon color='#e5e5e5' size={30} /> : <PlayIcon color='#e5e5e5' size={30} />}
                            </div>
                            <CircleChevronRight color='#e5e5e5' size={25} />
                        </div>
                        <Repeat color='#aeafac' size={20} />
                    </div>
                </div>
            </div>
            <div className='flex flex-col pt-20 gap-8 overflow-y-scroll'>
                {
                    lyrics.map((lyr, ind) => {

                        const lyricsStart = lyr.time;
                        const lyricsEnd = lyrics[ind + 1] ? lyrics[ind + 1].time : duration;
                        const isCurrentLyrics = currentTime >= lyricsStart && currentTime <= lyricsEnd;
                        const durationOfSentence = lyricsEnd - lyricsStart;
                        const totalChars = lyr.text.length;
                        const progress = Math.min(
                            Math.max((currentTime - lyricsStart) / durationOfSentence, 0),
                            1
                        );
                        return <div
                            ref={(el) => { lyricRefs.current[ind] = el; }}
                            onClick={() => identifyClicks(lyr.time)} key={ind}>
                            {
                                lyr.text.split("").map((txt, index) => {

                                    const charProgress = index / totalChars;
                                    const isVisible = progress >= charProgress;
                                    const isPast = currentTime > lyricsStart;

                                    return <span style={{
                                        willChange: "transform, opacity, filter",
                                        display: "inline-flex",
                                        transitionDelay: `${index * 0.04}s`,
                                        transform: isPast || (isCurrentLyrics && isVisible) ? "translateY(0px)" : "translateY(10px)",
                                        filter: isPast || (isCurrentLyrics && isVisible) ? "blur(0px)" : "blur(1px)",
                                    }} className={`text-2xl font-bold transition-[transform,opacity,filter] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] ${isPast || (isCurrentLyrics && isVisible) ? "opacity-100 scale-100" : "opacity-40 scale-95"}`}
                                        key={index}>
                                        {txt === " " ? "\u00A0" : txt}
                                    </span>
                                })
                            }
                        </div>
                    })
                }
            </div>
        </div >
    )
}

export default Music