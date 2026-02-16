# GC Persona – Legal Command Center Prototype

General Counsel persona dashboard prototype (Next.js).

## Run locally

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Development**
   ```bash
   npm run dev
   ```
   Then open **http://127.0.0.1:3000** in your browser.

   The dev server is bound to `127.0.0.1` to avoid network interface issues on some systems. If port 3000 is in use, run:
   ```bash
   npx next dev --hostname 127.0.0.1 --port 3001
   ```
   and open http://127.0.0.1:3001

3. **Production build**
   ```bash
   npm run build
   npm run start
   ```
   Then open **http://127.0.0.1:3000**

## If the dev server won’t start

- **“Unable to acquire lock”** – Another `next dev` is running. Stop it (or close the terminal that’s running it), then run `npm run dev` again.
- **“address already in use”** – Port 3000 is taken. Use another port:  
  `npx next dev --hostname 127.0.0.1 --port 3001`  
  and open http://127.0.0.1:3001
- **“uv_interface_addresses” / system error** – The scripts use `--hostname 127.0.0.1` to reduce this. If it still happens, run with an explicit host and port as above.
