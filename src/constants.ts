import React from 'react';
import { ThemeOption } from './types';

// Using a simple object map for icons to avoid extra dependencies, 
// using SVG strings or simple functional components would be ideal here 
// but for standard icons we can use an SVG component helper.

const createSVG = (path: React.ReactNode, props: React.SVGProps<SVGSVGElement>) => (
  React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    strokeWidth: 1.5,
    stroke: "currentColor",
    ...props
  }, path)
);

export const ICONS = {
  Plus: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 4.5v15m7.5-7.5h-15" }), props
  ),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" }), props
  ),
  Trash: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" }), props
  ),
  Eye: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement(React.Fragment, null, 
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" }),
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
    ), props
  ),
  Share: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" }), props
  ),
  ArrowLeft: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" }), props
  ),
  Check: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 12.75l6 6 9-13.5" }), props
  ),
  Star: (props: React.SVGProps<SVGSVGElement>) => createSVG(
     React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" }), props
  ),
  Heart: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" }), props
  ),
  Zap: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" }), props
  ),
  Calendar: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" }), props
  ),
  Clock: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" }), props
  ),
  ChevronUp: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.5 15.75l7.5-7.5 7.5 7.5" }), props
  ),
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 8.25l-7.5 7.5-7.5-7.5" }), props
  ),
  Text: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" }), props
  ),
  List: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" }), props
  ),
  Copy: (props: React.SVGProps<SVGSVGElement>) => createSVG(
      React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5" }), props
  ),
  Palette: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" }), props
  ),
  X: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }), props
  ),
  Link: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" }), props
  ),
  ExternalLink: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" }), props
  ),
  Branch: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" }), props
  ),
  GitBranch: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12.75L11.25 15 9 17.25m-4.875-.27a2.25 2.25 0 01-2.25-2.25V6.375a2.25 2.25 0 012.25-2.25h6a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-6z" }), props
  ),
  Mic: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" }), props
  ),
  Section: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" }), props
  ),
  // New icons for AI Assistant
  Bot: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" }), props
  ),
  Wrench: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 3.75h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" }), props
  ),
  PlusCircle: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" }), props
  ),
  Edit: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" }), props
  ),
  LightBulb: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m0 0a6.01 6.01 0 00-1.5.189m1.5-.189v-5.06" }), props
  ),
  Magic: (props: React.SVGProps<SVGSVGElement>) => createSVG(
    React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" }), props
  )
};

interface ThemeConfig {
  label: string;
  colors: string[];
}

export const THEMES: Record<ThemeOption, ThemeConfig> = {
  nebula: {
    label: 'Nebula',
    colors: ['bg-slate-900', 'text-cyan-400'],
  },
  midnight: {
    label: 'Midnight',
    colors: ['bg-black', 'text-indigo-400'],
  },
  cyberpunk: {
    label: 'Cyberpunk',
    colors: ['bg-yellow-400', 'text-black'],
  },
  sunset: {
    label: 'Sunset',
    colors: ['bg-orange-500', 'text-white'],
  }
};