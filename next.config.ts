import type { NextConfig } from "next";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";

const compileTypeScriptScripts = () => {
  console.log('Compiling TypeScript scripts for production...');
  
  const scriptsDir = path.join(process.cwd(), 'scripts');
  const tsFiles = fs.readdirSync(scriptsDir)
    .filter(file => file.endsWith('.ts') && !file.includes('.d.ts'));
  
  tsFiles.forEach(file => {
    const tsPath = path.join(scriptsDir, file);
    const jsPath = path.join(scriptsDir, file.replace('.ts', '.js'));
    
    try {
      console.log(`Compiling ${file}...`);
      // Using tsc to compile a single file
      execSync(`npx tsc --allowJs --esModuleInterop --resolveJsonModule ${tsPath} --outDir ${scriptsDir}`);
      console.log(`Successfully compiled ${file} to JavaScript`);
    } catch (error) {
      console.error(`Error compiling ${file}:`, error);
    }
  });
  
  console.log('TypeScript script compilation completed');
};

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during production builds for now
    ignoreDuringBuilds: true
  },
  
  // Custom webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Add custom webpack configuration if needed
    return config;
  },
  
  // Run script during the build process
  onBuild: async () => {
    if (process.env.NODE_ENV === 'production') {
      compileTypeScriptScripts();
    }
  }
};

// Execute the compilation when this config is loaded in production
if (process.env.NODE_ENV === 'production') {
  compileTypeScriptScripts();
}

export default nextConfig;
