interface ClientGLBConfig {
  baseUrl: string;
  pathTemplate: string;
}

const glbUrlConfig: Record<string, ClientGLBConfig> = {
  "SoffaDirekt": {
    baseUrl: "https://sd.charpstar.net",
    pathTemplate: "Android/{articleId}.glb"
  },
  "SharkGaming": {
    baseUrl: "https://cdn.charpstar.net/SharkGaming",
    pathTemplate: "Android/{articleId}.glb"
  },
  "Kajakk-Fritid": {
    baseUrl: "https://skh.charpstar.net",
    pathTemplate: "Android/{articleId}.glb"
  }
};

export function getGlbUrl(company: string, articleId: string): string {
  const config = glbUrlConfig[company];
  if (!config) {
    throw new Error(`No GLB URL configuration found for company: ${company}`);
  }

  const path = config.pathTemplate.replace("{articleId}", articleId);
  return `${config.baseUrl}/${path}`;
}