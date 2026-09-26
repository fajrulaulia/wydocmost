# सुरक्षा नीति

यह सुरक्षा नीति 10 भाषाओं में उपलब्ध है। अंग्रेज़ी इसका आधिकारिक मूल संस्करण है; अनुवाद केवल सुविधा के लिए हैं। अनुवाद और अंग्रेज़ी पाठ में अंतर होने पर अंग्रेज़ी संस्करण मान्य होगा।

[English](SECURITY.md) | [Bahasa Indonesia](SECURITY.id.md) | [简体中文](SECURITY.zh-CN.md) | हिन्दी | [Español](SECURITY.es.md) | [Français](SECURITY.fr.md) | [العربية](SECURITY.ar.md) | [বাংলা](SECURITY.bn.md) | [Português](SECURITY.pt-BR.md) | [Русский](SECURITY.ru.md)

## समर्थित संस्करण

`wydocmost` के केवल नवीनतम प्रकाशित संस्करण को सुरक्षा सुधार मिलते हैं। पुराने संस्करण समर्थित नहीं हैं; सुरक्षा समस्या की रिपोर्ट करने से पहले नवीनतम रिलीज़ पर अपडेट करें।

CLI के लिए Node.js 20 या नया संस्करण आवश्यक है। यह Docmost इंस्टेंस के HTTP API का उपयोग करके उससे जुड़ता है। Docmost के अलग-अलग संस्करणों के साथ संगतता बदल सकती है; रिपोर्ट में Docmost संस्करण और deployment विवरण दें, लेकिन credentials या session token शामिल न करें।

## सुरक्षा कमजोरी की रिपोर्ट

संभावित सुरक्षा कमजोरियों की सूचना project maintainer को निजी रूप से दें। यदि project GitHub पर होस्ट है और private vulnerability reporting सक्षम है, तो repository का **Report a vulnerability** विकल्प उपयोग करें। अन्यथा maintainer द्वारा दिए गए निजी संपर्क माध्यम का उपयोग करें। सार्वजनिक issue या चर्चा में exploit विवरण, credentials या token न डालें।

प्रभावित package संस्करण, Node.js संस्करण, Docmost संस्करण, प्रभाव और समस्या दोहराने के चरण शामिल करें। संवेदनशील होने पर hostname या अन्य पहचान-संबंधी जानकारी छिपाएँ। Maintainer रिपोर्ट मिलने की पुष्टि करेगा और रिपोर्ट करने वाले के साथ सुधार तथा खुलासा समय-सीमा तय करेगा।

## स्थानीय credentials

`wydocmost login` Docmost session token सहेजने के लिए operating system keychain या JSON file का विकल्प देता है। डिफ़ॉल्ट रूप से keychain चुना जाता है। यदि system credential store token सहेज नहीं पाता, तो CLI चेतावनी देकर JSON पर fallback करता है। JSON file का नाम `credentials.json` है और यह configured credentials directory में रहती है। डिफ़ॉल्ट स्थान `~/.config/wydocmost/credentials.json` है; `XDG_CONFIG_HOME`, `--config-dir` या `WYDOCMOST_CONFIG_DIR` से दूसरा स्थान चुना जा सकता है। समर्थित operating systems पर CLI file permission `0600` मांगता है और नई credentials directory को `0700` permission से बनाता है। Keychain mode में JSON file में केवल keychain entry खोजने का metadata होता है, token नहीं। Credentials directory को निजी रखें, खासकर custom path चुनने पर। Password सहेजा नहीं जाता।

यदि token उजागर हो गया हो सकता है, तो Docmost में उपलब्ध होने पर session revoke करें, स्थानीय credentials file हटाएँ और नया session सहेजने के लिए `wydocmost login` चलाएँ।

`credentials.json`, environment files या अन्य secrets commit न करें। Repository आम credentials और environment file नामों को ignore करता है। npm package में README, license, security policy दस्तावेज़, package manifest और compiled CLI files शामिल हैं; स्थानीय credentials शामिल नहीं हैं।

## इंडोनेशिया में व्यक्तिगत डेटा संरक्षण (UU PDP)

इंडोनेशिया का व्यक्तिगत डेटा संरक्षण कानून, **2022 का कानून संख्या 27 (UU PDP)**, लागू है। [आधिकारिक नियम रिकॉर्ड](https://peraturan.go.id/id/uu-no-27-tahun-2022) या [आधिकारिक कानून पाठ](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) देखें।

`wydocmost` Docmost session credentials को स्थानीय रूप से सहेजता है और उपयोगकर्ता द्वारा चुने गए Docmost instance को authenticated requests भेजता है। Credentials directory को निजी रखें और session token साझा न करें। CLI का उपयोग करने वाले संगठनों और व्यक्तियों को अपनी data-processing गतिविधियों और UU PDP तथा अन्य लागू नियमों के तहत अपनी जिम्मेदारियों का मूल्यांकन करना चाहिए। यह सूचना केवल संदर्भ के लिए है; यह किसी विशेष deployment या CLI उपयोग के कानूनी अनुपालन का दावा नहीं करती।

## लाइसेंस

यह project [MIT License](LICENSE) के तहत वितरित किया जाता है।
