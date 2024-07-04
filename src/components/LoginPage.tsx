import Image from "next/image";
import PendingFormLoader from "./PendingFormLoader";

export default function LoginPage({
  formAction,
}: {
  formAction: (formData: FormData) => void;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-36 lg:px-8">
         <Image
        src="/charpstar.svg"
        alt="Charpstar Logo"
        className="invert"
        width={200}
        height={100}
        priority
      />

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h3 className="mt-10 text-center text-3xl leading-9 tracking-tight text-white">
          Client Area
        </h3>
      </div>


      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" action={formAction}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium leading-6 text-white"
            >
              Email address
            </label>

            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border-0 py-1.5  shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-white"
              >
                Password
              </label>
            </div>

            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <div className="flex h-6 items-center justify-center">
                <PendingFormLoader>Sign in</PendingFormLoader>
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
