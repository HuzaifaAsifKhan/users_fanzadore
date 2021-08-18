import Document, {
  Html, Head, Main, NextScript
} from 'next/document';
import { settingService } from '@services/setting.service';

class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const resp = await settingService.all();
    const settings = resp.data;
    return {
      ...initialProps,
      settings
    };
  }

  render() {
    const { settings } = this.props as any;
    return (
      <Html>
        <Head>
          <link rel="icon" href={settings && settings.favicon} sizes="64x64" />
          <meta name="keywords" content={settings && settings.metaKeywords} />
          <meta
            name="description"
            content={settings && settings.metaDescription}
          />
          <meta
            name="viewport"
            content="initial-scale=1.0, width=device-width"
          />
          {/* OG tags */}
          <meta
            property="og:title"
            content={settings && settings.siteName}
            key="title"
          />
          <meta property="og:image" content={settings && settings.logoUrl} />
          <meta
            property="og:keywords"
            content={settings && settings.metaKeywords}
          />
          <meta
            property="og:description"
            content={settings && settings.metaDescription}
          />
          {/* GA code */}
          {settings && settings.gaCode && (
            <script
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${settings.gaCode}');`
              }}
            />
          )}
          {/* extra script */}
          {settings && settings.headerScript && (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: settings.headerScript }} />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
        {/* extra script */}
        {settings && settings.afterBodyScript && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: settings.afterBodyScript }} />
        )}
      </Html>
    );
  }
}

export default CustomDocument;
