import { ReactNode } from 'react';
import { motion, useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

type Props = {
  children: ReactNode;
  /** optional delay in seconds */
  delay?: number;
  /** optional className for wrapper div */
  className?: string;
};

export const ScrollFade = ({ children, delay = 0, className = '' }: Props) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const variants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay } },
  };

  useEffect(() => {
    if (inView) controls.start('visible');
  }, [inView, controls]);

  return (
    <motion.div
      ref={ref as any}
      initial="hidden"
      animate={controls}
      variants={variants} 
      className={className}
    >
      {children}
    </motion.div>
  );
};
