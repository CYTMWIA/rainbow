import { ReactNode, useEffect, useState } from 'react';

function useAnimation(initAnimationClassName: string): [
    string,
    (e: React.AnimationEvent<HTMLDivElement>) => void,
    (animationClassName: string, onEnd?: () => void) => void
] {
    const [animationClassName, setAnimationClassName] = useState(initAnimationClassName);
    const [onAnimationEnd, setOnAnimationEnd_] = useState(() => (e: React.AnimationEvent<HTMLDivElement>) => { });
    const setOnAnimationEnd = (fun: (e: React.AnimationEvent<HTMLDivElement>) => void) => setOnAnimationEnd_(() => fun);

    const triggerAnimation = (animationClassName: string, onEnd?: () => void) => {
        setAnimationClassName(animationClassName)
        if (onEnd) {
            setOnAnimationEnd((e) => {
                onEnd()
            })
        }
    }

    return [animationClassName, onAnimationEnd, triggerAnimation];
}

export function FadeInOut(props: { children: ReactNode }) {
    const [animationClassName, onAnimationEnd, triggerAnimation] = useAnimation('animation-fade-in')
    const [content, setContent] = useState(props.children)

    useEffect(() => {
        triggerAnimation('animation-fade-out', () => {
            setContent(props.children)
            triggerAnimation('animation-fade-in')
        })
    }, [props.children])

    return <div className={animationClassName} onAnimationEnd={onAnimationEnd}>{content}</div>
}
