# A Level Mechanics Lab

An interactive Edexcel A Level Mathematics (9MA0) mechanics modelling laboratory, covering forces, Newton's laws, friction, connected particles and diagrams.

- **New GitHub Pages domain:** https://mechanics.mrwalkermaths.com/
- **Original Netlify domain:** https://alevelmechanicslab.netlify.app/
- **Repository:** https://github.com/chriswalker-afk/mechanicslab

## GitHub Pages setup

After merging the migration pull request:

1. Open [Settings → Pages](https://github.com/chriswalker-afk/mechanicslab/settings/pages).
2. Select **Deploy from a branch**, choose **main / (root)**, and save.
3. Under **Custom domain**, enter `mechanics.mrwalkermaths.com` and save.
4. Wait for GitHub to provision the certificate, then enable **Enforce HTTPS** and verify the new address.

Cloudflare DNS is configured with a **DNS-only CNAME** for `mechanics.mrwalkermaths.com` pointing to `chriswalker-afk.github.io`.

## Migration provenance

The exact current live site was downloaded from Netlify on **4 November 2026**. It is a self-contained HTML application with one embedded stylesheet and one embedded JavaScript block, requiring no Netlify Functions or external asset files.

The sole change to application delivery was to remove Netlify's injected HUD/dashboard script, which only works on Netlify hosting. All underlying teaching materials and mechanics simulation logic are unchanged.

A GitHub Actions comparison against the original Netlify site passed with **identical normalized content**, SHA-256:
`321d530c62489925190073078204388d11e0d754657b9094de4fa445658ce435`.

The imported `index.html` has 640,939 bytes. A GitHub Actions suite checks its standalone structure, embedded JavaScript syntax and custom-domain marker.

**Keep Netlify active** until the new GitHub Pages website is verified as working in a real browser. If the app stores browser state in the future, that state will be tied to the hostname and won't transfer automatically.
