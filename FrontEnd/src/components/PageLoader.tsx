import { useMemo } from "react"
import { motion } from "framer-motion"
import { Wallet, Banknote, Coins } from "lucide-react"

export default function PageLoader() {
  // Pre-calculate all values for money icons using useMemo with deterministic randomness
  const moneyItems = useMemo(() => {
    const baseIcons = [
      { id: 1, Icon: Coins, baseDelay: 0 },
      { id: 2, Icon: Banknote, baseDelay: 0.3 },
      { id: 3, Icon: Coins, baseDelay: 0.6 },
      { id: 4, Icon: Banknote, baseDelay: 0.9 },
      { id: 5, Icon: Coins, baseDelay: 1.2 },
      { id: 6, Icon: Banknote, baseDelay: 1.5 },
    ]

    // Use a deterministic approach based on id instead of Math.random()
    return baseIcons.map((icon, index) => ({
      ...icon,
      randomX: icon.id % 2 === 0 ? 80 : -80, // Deterministic: even ids go right, odd go left
      randomDelay: icon.baseDelay + (index % 6) * 0.2,
    }))
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8">
        {/* Wallet Animation Container */}
        <div className="relative h-32 w-32">
          {/* Center Wallet Icon with Pulse */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Wallet className="h-24 w-24 text-primary" strokeWidth={1.5} />
          </motion.div>

          {/* Flying Money Animation */}
          {moneyItems.map((item) => (
            <motion.div
              key={item.id}
              className="absolute top-0 left-1/2 -translate-x-1/2"
              initial={{
                y: -60,
                x: item.randomX,
                opacity: 1,
                scale: 1,
              }}
              animate={{
                y: 0,
                x: 0,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{
                duration: 1.2,
                ease: "easeIn",
                delay: item.randomDelay,
                repeat: Infinity,
                repeatDelay: 1.8,
              }}
            >
              <item.Icon className="h-6 w-6 text-green-500" strokeWidth={2} />
            </motion.div>
          ))}
        </div>

        {/* Loading Text */}
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center"
        >
          <p className="text-lg font-medium text-slate-900">
            Loading your finances...
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Please wait while we fetch your data
          </p>
        </motion.div>
      </div>
    </div>
  )
}
