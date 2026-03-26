'use client';

import Script from 'next/script';

export default function TrackingScripts() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const rb2bId = process.env.NEXT_PUBLIC_RB2B_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      {/* Google Analytics 4 */}
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Microsoft Clarity */}
      {clarityId && (
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      )}

      {/* RB2B Visitor Identification */}
      {rb2bId && (
        <Script id="rb2b" strategy="afterInteractive">
          {`
            !function () {var reb2b = window.reb2b = window.reb2b || [];
            if (reb2b.invoked) return;reb2b.invoked = true;reb2b.methods = ["identify", "collect"];
            reb2b.factory = function (method) {return function () {var args = Array.prototype.slice.call(arguments);
            args.unshift(method);reb2b.push(args);return reb2b;};};
            for (var i = 0; i < reb2b.methods.length; i++) {var key = reb2b.methods[i];reb2b[key] = reb2b.factory(key);}
            reb2b.load = function (key) {var script = document.createElement("script");script.type = "text/javascript";
            script.async = true;script.src = "https://s3-us-west-2.amazonaws.com/b2bjsstore/b/" + key + "/reb2b.js.gz";
            var first = document.getElementsByTagName("script")[0];first.parentNode.insertBefore(script, first);};
            reb2b.SNIPPET_VERSION = "1.0.1";reb2b.load("${rb2bId}");}();
          `}
        </Script>
      )}
    </>
  );
}
