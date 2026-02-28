/** @type {import('next').NextConfig} */
const withNextIntl = require('next-intl/plugin')('./i18n/request.ts')
const path = require('path')

const nextConfig = {
  turbopack: {
    root: path.join(__dirname)
  }
}

module.exports = withNextIntl(nextConfig)
