module.exports = {
    "packagerConfig": {
        "icon": "build/icon.icns",
        "osxSign": {
            "identity": process.env.APPLE_IDENTITY,
            "hardened-runtime": true,
            "entitlements": "entitlements.plist",
            "entitlements-inherit": "entitlements.plist",
            "signature-flags": "library",
            "gatekeeper-assess": false
        },
        "osxNotarize": {
            "appBundleId": "com.joelpodrebarac.mobtime",
            "appleId": process.env.APPLE_ID,
            "appleIdPassword": process.env.APPLE_ID_PASSWORD,
        }
    },
    "makers": [
        {
            "name": "@electron-forge/maker-squirrel",
            "config": {
                "name": "mobtime_native"
            }
        },
        {
            "name": "@electron-forge/maker-zip",
            "platforms": [
                "darwin"
            ]
        },
        {
            "name": "@electron-forge/maker-deb",
            "config": {}
        },
        {
            "name": "@electron-forge/maker-rpm",
            "config": {}
        }
    ],
    "publishers": [
        {
            "name": "@electron-forge/publisher-github",
            "config": {
                "repository": {
                    "owner": "ajoelp",
                    "name": "mobtime-native"
                }
            }
        }
    ],
    "plugins": [
        [
            "@electron-forge/plugin-webpack",
            {
                mainConfig: "./webpack.config.js",
                renderer: { entryPoints: [] }
            }
        ]
    ]
}