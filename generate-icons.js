const fs = require('fs');
const sharp = require('sharp');

// Create icons directory if it doesn't exist
if (!fs.existsSync('./icons')) {
    fs.mkdirSync('./icons');
}

// SVG content for our icon (using Option 2 - Graph with Rupee Symbol as it's more relevant)
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512">
    <rect width="512" height="512" fill="#2563eb"/>
    <path d="M256 96l96 96-96 96-96-96z" fill="white"/>
    <text x="256" y="288" font-size="160" text-anchor="middle" fill="white" font-family="Arial">₹</text>
</svg>
`;

// Save the SVG first
fs.writeFileSync('./icons/icon.svg', svgContent);

// Generate PNG icons in different sizes
async function generateIcons() {
    const sizes = [192, 512];
    
    for (const size of sizes) {
        await sharp('./icons/icon.svg')
            .resize(size, size)
            .png()
            .toFile(`./icons/icon-${size}x${size}.png`);
    }
}

generateIcons().catch(console.error); 