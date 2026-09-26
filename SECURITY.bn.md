# নিরাপত্তা নীতি

এই নিরাপত্তা নীতি ১০টি ভাষায় উপলভ্য। ইংরেজি হলো মূল ও প্রামাণ্য সংস্করণ; অনুবাদগুলো সুবিধার জন্য দেওয়া হয়েছে। কোনো অনুবাদের সঙ্গে ইংরেজি পাঠের অমিল হলে ইংরেজি সংস্করণই প্রাধান্য পাবে।

[English](SECURITY.md) | [Bahasa Indonesia](SECURITY.id.md) | [简体中文](SECURITY.zh-CN.md) | [हिन्दी](SECURITY.hi.md) | [Español](SECURITY.es.md) | [Français](SECURITY.fr.md) | [العربية](SECURITY.ar.md) | বাংলা | [Português](SECURITY.pt-BR.md) | [Русский](SECURITY.ru.md)

## সমর্থিত সংস্করণ

শুধু `wydocmost`-এর সর্বশেষ প্রকাশিত সংস্করণে নিরাপত্তা সংশোধন দেওয়া হয়। পুরোনো সংস্করণগুলো আর সমর্থিত নয়; নিরাপত্তা সমস্যা জানানোর আগে সর্বশেষ সংস্করণে আপডেট করুন।

CLI চালাতে Node.js 20 বা তার পরের সংস্করণ প্রয়োজন। এটি Docmost ইনস্ট্যান্সের HTTP API ব্যবহার করে সেই ইনস্ট্যান্সে সংযোগ করে। Docmost সংস্করণভেদে সামঞ্জস্য আলাদা হতে পারে; প্রতিবেদনে Docmost সংস্করণ ও deployment-এর বিবরণ দিন, তবে credentials বা session token দেবেন না।

## দুর্বলতা জানানোর নিয়ম

সম্ভাব্য দুর্বলতার কথা project maintainer-কে ব্যক্তিগতভাবে জানান। project GitHub-এ থাকলে এবং private vulnerability reporting চালু থাকলে repository-এর **Report a vulnerability** সুবিধা ব্যবহার করুন। অন্যথায় maintainer-এর দেওয়া ব্যক্তিগত যোগাযোগের মাধ্যম ব্যবহার করুন। প্রকাশ্য issue বা আলোচনায় exploit-এর বিবরণ, credentials বা token দেবেন না।

প্রভাবিত package সংস্করণ, Node.js সংস্করণ, Docmost সংস্করণ, প্রভাব এবং পুনরুৎপাদনের ধাপ জানান। সংবেদনশীল হলে hostname বা অন্য শনাক্তকারী তথ্য আড়াল করুন। maintainer প্রতিবেদন পাওয়ার বিষয়টি নিশ্চিত করতে এবং প্রতিবেদনকারীর সঙ্গে সমাধান ও প্রকাশের সময়সূচি সমন্বয় করতে পারেন, তবে উত্তর বা সমাধানের সময় নিশ্চিত নয়।

## স্থানীয় credentials

Docmost session token সংরক্ষণের জন্য `wydocmost login` অপারেটিং সিস্টেমের keychain অথবা JSON file-এর বিকল্প দেয়। ডিফল্টভাবে keychain বেছে নেওয়া হয়। system credential store token সংরক্ষণ করতে না পারলে CLI সতর্ক করে JSON-এ fallback করে। JSON file-এর নাম `credentials.json` এবং এটি কনফিগার করা credentials directory-তে থাকে। ডিফল্ট অবস্থান `~/.config/wydocmost/credentials.json`; `XDG_CONFIG_HOME`, `--config-dir` অথবা `WYDOCMOST_CONFIG_DIR` দিয়ে অন্য অবস্থান বেছে নেওয়া যায়। সমর্থিত অপারেটিং সিস্টেমে CLI file permission `0600` চায় এবং নতুন credentials directory `0700` permission-এ তৈরি করে। keychain ব্যবহার করলে JSON file-এ শুধু keychain entry খুঁজে পাওয়ার metadata থাকে, token থাকে না। credentials directory ব্যক্তিগত রাখুন, বিশেষ করে custom path বেছে নিলে। Password সংরক্ষণ করা হয় না।

Token প্রকাশ হয়ে থাকতে পারে মনে হলে Docmost-এ সম্ভব হলে session revoke করুন, স্থানীয় credentials file মুছুন এবং নতুন session সংরক্ষণের জন্য `wydocmost login` চালান।

`credentials.json`, environment file বা অন্য secret commit করবেন না। repository সাধারণ credentials ও environment file-এর নাম ignore করে। npm package-এ README, license, security policy নথি, package manifest এবং compiled CLI file থাকে; স্থানীয় credentials থাকে না।

## ইন্দোনেশিয়ায় ব্যক্তিগত তথ্য সুরক্ষা (UU PDP)

ইন্দোনেশিয়ার Personal Data Protection Law, **2022 সালের আইন নং 27 (UU PDP)** কার্যকর রয়েছে। [সরকারি বিধির রেকর্ড](https://peraturan.go.id/id/uu-no-27-tahun-2022) অথবা [আইনের সরকারি পাঠ](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022) দেখুন।

`wydocmost` Docmost session credentials স্থানীয়ভাবে সংরক্ষণ করে এবং ব্যবহারকারী নির্বাচিত Docmost ইনস্ট্যান্সে authenticated request পাঠায়। credentials directory ব্যক্তিগত রাখুন এবং session token শেয়ার করবেন না। CLI ব্যবহারকারী সংস্থা ও ব্যক্তিদের নিজেদের data processing কার্যক্রম এবং UU PDP ও অন্যান্য প্রযোজ্য নিয়মের অধীনে নিজেদের দায়িত্ব মূল্যায়ন করা উচিত। এই নোটটি কেবল তথ্যসূত্র; কোনো নির্দিষ্ট deployment বা CLI ব্যবহারের আইন-অনুবর্তিতার দাবি করে না।

## লাইসেন্স

এই project [MIT License](LICENSE)-এর অধীনে বিতরণ করা হয়।

## সহায়তা ও আইনি বিজ্ঞপ্তি

`wydocmost` MIT License-এর অধীনে open-source software হিসেবে দেওয়া হয়; warranty ও liability-এর শর্তের জন্য [LICENSE](LICENSE) দেখুন। maintainer সহায়তা, প্রতিটি issue বা vulnerability report-এর উত্তর, সমাধান, কিংবা উত্তর বা সমাধানের সময়সীমার নিশ্চয়তা দেন না। এই নথি আইনি পরামর্শ নয় এবং কোনো নির্দিষ্ট ব্যবহার যে কোনো আইন মেনে চলে তার নিশ্চয়তাও দেয় না। CLI তাদের ব্যবহারের জন্য উপযুক্ত কি না নির্ধারণ, নিজস্ব সিস্টেম ও credentials সুরক্ষিত রাখা এবং UU PDP প্রযোজ্য হলে সেটিসহ নিজেদের আইনি দায়িত্ব মূল্যায়নের দায়িত্ব ব্যবহারকারী ও প্রতিষ্ঠানের। প্রযোজ্য আইনে যেসব অধিকার ত্যাগ বা দায়িত্ব/দায় বাদ দেওয়া যায় না, এই বিজ্ঞপ্তি সেগুলো ত্যাগ বা বাদ দেওয়ার উদ্দেশ্যে লেখা নয়।
