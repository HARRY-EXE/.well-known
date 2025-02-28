# Linking a GitHub Pages Domain to Discord Connections

You can link your domain to your Discord connections and showcase it on your profile. For GitHub Pages domains, verification via DNS may not be possible, so we'll use the HTTPS file method instead.

### Steps:

1. **Open Discord Settings:**
   - Launch Discord and navigate to your **User Settings** by clicking the gear icon next to your username.

2. **Access Connections:**
   - In the settings menu, go to **Connections**.

3. **Add Your Domain:**
   - Select the **Domain** option.  
   - Enter your GitHub Pages domain name (e.g., `https://github.com/SauravhXyzz/Sauravh-Xyzz.github.io`).

4. **Choose HTTPS Verification:**
   - Click on **Next**, then choose **Verify using HTTPS**.

5. **Copy the Verification Content:**
   - Discord will provide a string, e.g., `dh=123456abc`. Copy this value.

6. **Fork the Verification Repository:**
   - Go to the [`.well-knownn` repository](https://github.com/harry-exe/.well-known/fork) and fork it.  
   *(You can also create a new repository, but ensure it is named `.well-known`.)*

7. **Edit the `discord` File:**
   - In the root of the forked repository, locate the `discord` file.  
   - Replace its content with the string copied in **Step 5** (`dh=123456abc`).  
   - Commit the changes.

8. **Enable GitHub Pages:**
   - Navigate to the **Settings** of your forked repository.  
   - Under the **Pages** section, enable GitHub Pages. Select the appropriate branch (usually `main`) and root directory.

9. **Verify on Discord:**
   - Go back to Discord and click the **Verify** button.  
   - Once verified, your domain will appear on your Discord profile.

---

If this guide was helpful, please consider starring the [repository](https://github.com/SauravhXyzz/.well-knownn). Thank you!
