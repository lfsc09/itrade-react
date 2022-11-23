import { useCallback, useRef } from 'react';

/*
    Executa uma função depois de tantos milisegundos. Podendo ser usada para simular um longPress.
    Ex:
        const [onStart, onEnd] = useLongPress(func, 500);
        ...
        <Button onTouchStart={onStart} onTouchEnd={onEnd} />

    @props : [
        callback : Função a ser executada ao final do timer.
        ms       : Tempo em milisegundos
    ]
*/
export default function useLongPress(callback = () => {}, ms = 300) {
    // used to persist the timer state
    // non zero values means the value has never been fired before
    const timerRef = useRef(0);

    // clear timed callback
    const endTimer = () => {
        clearTimeout(timerRef.current || 0);
        timerRef.current = 0;
    };

    // init timer
    const onStartLongPress = useCallback(
        (e) => {
            // stop any previously set timers
            endTimer();

            // set new timeout
            timerRef.current = window.setTimeout(() => {
                callback();
                endTimer();
            }, ms);
        },
        [callback, ms]
    );

    // determine to end timer early and invoke the callback or do nothing
    const onEndLongPress = useCallback(() => {
        endTimer();
    }, []);

    return [onStartLongPress, onEndLongPress, endTimer];
}
