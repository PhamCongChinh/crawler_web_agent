import { GPMLoginSDK } from './GPMLoginSDK.js';

const gpm = new GPMLoginSDK({
  	url: 'http://127.0.0.1:19995',
});

(async () => {
    const profiles = await gpm.getProfiles();
    console.log('Tổng số profile:', profiles.length);

    if (profiles.length > 0) {
        const profileId = profiles[0].id;
        console.log('Mở profile:', profileId);

        const browser = await gpm.startProfile(profileId);
        const page = await browser.newPage();
        await page.goto('https://google.com');
        console.log('✅ Đã mở Google');

        await gpm.stopProfile(profileId);
        console.log('🧹 Đã dừng profile');
    }
})();
