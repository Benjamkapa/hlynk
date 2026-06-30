import { useEffect, useState } from 'react'
import {
  Smartphone,
  Download,
  Share,
  Plus,
  Check,
  Apple,
} from 'lucide-react'

type InstallPrompt = any

export default function GetTheApp() {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null)
  const [installed, setInstalled] = useState(false)
  const [showIOS, setShowIOS] = useState(false)

  useEffect(() => {
    const beforeInstall = (e: Event) => {
      e.preventDefault()
      setPrompt(e)
    }

    const installed = () => {
      setInstalled(true)
      setPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', beforeInstall)
    window.addEventListener('appinstalled', installed)

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  async function installAndroid() {
    if (!prompt) return

    prompt.prompt()
    const { outcome } = await prompt.userChoice

    if (outcome === 'accepted') {
      setInstalled(true)
      setPrompt(null)
    }
  }

  return (
    <section
      id="get-the-app"
      className="border-t bg-white py-10"
    >
      <div className="mx-auto max-w-3xl px-6">

        {/* Header */}
        <div className="text-center">

          <h2 className="mt-6 text-4xl font-bold">
            Get hlynk on your phone
          </h2>

          <p className="mt-4 text-slate-500">
            Install directly from your browser.
            Fast, offline-ready, and always updated.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">

          {/* Android */}
          <button
            onClick={installAndroid}
            disabled={!prompt || installed}
            className={`
              rounded-2xl p-6 text-left transition
              ${installed
                ? 'bg-green-50'
                : prompt
                  ? 'bg-slate-100 shadow-sm hover:shadow text-black hover:opacity-90'
                  : 'bg-slate-100'
              }
            `}
          >
            <div className="flex items-center gap-3">

              {installed ? (
                <Check />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
                  <path fill="#7cb342" d="M12 29c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V29zM40 29c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V29zM22 40c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V40zM30 40c0 1.1-.9 2-2 2s-2-.9-2-2v-9c0-1.1.9-2 2-2s2 .9 2 2V40z"></path><path fill="#7cb342" d="M14 18v15c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V18H14zM24 8c-6 0-9.7 3.6-10 8h20C33.7 11.6 30 8 24 8zM20 13.6c-.6 0-1-.4-1-1 0-.6.4-1 1-1s1 .4 1 1C21 13.1 20.6 13.6 20 13.6zM28 13.6c-.6 0-1-.4-1-1 0-.6.4-1 1-1s1 .4 1 1C29 13.1 28.6 13.6 28 13.6z"></path><path fill="#7cb342" d="M28.3 10.5c-.2 0-.4-.1-.6-.2-.5-.3-.6-.9-.3-1.4l1.7-2.5c.3-.5.9-.6 1.4-.3.5.3.6.9.3 1.4l-1.7 2.5C29 10.3 28.7 10.5 28.3 10.5zM19.3 10.1c-.3 0-.7-.2-.8-.5l-1.3-2.1c-.3-.5-.2-1.1.3-1.4.5-.3 1.1-.2 1.4.3l1.3 2.1c.3.5.2 1.1-.3 1.4C19.7 10 19.5 10.1 19.3 10.1z"></path>
                </svg>
              )}

              <div>
                <p className=" opacity-70">
                  {installed
                    ? 'Installed'
                    : prompt
                      ? 'Install now'
                      : 'Open in Chrome'}
                </p>

                <h3 className="font-bold">
                  Android
                </h3>
              </div>
            </div>
          </button>

          {/* iOS */}
          <button
            onClick={() => setShowIOS(!showIOS)}
            className="rounded-2xl shadow-sm hover:shadow p-6 text-left bg-slate-100"
          >
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
                <path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z"></path>
              </svg>

              <div>
                <p className="text-slate-500">
                  iPhone & iPad
                </p>

                <h3 className="font-bold">
                  Install on iOS
                </h3>
              </div>
            </div>
          </button>

        </div>

        {/* iOS Instructions */}
        {showIOS && (
          <div className="mt-6 rounded-2xl border bg-slate-50 p-5">
            <ol className="space-y-3 text-sm">

              <li className="flex gap-3">
                <Share size={16} />
                Open in Safari
              </li>

              <li className="flex gap-3">
                <Share size={16} />
                Tap Share
              </li>

              <li className="flex gap-3">
                <Plus size={16} />
                Add to Home Screen
              </li>

            </ol>
          </div>
        )}

        <p className="mt-10 text-center text-sm text-slate-400">
          Progressive Web App • Offline • Instant updates
        </p>

      </div>
    </section>
  )
}