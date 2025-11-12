# 涓変釜椤圭洰 FHEVM 閰嶇疆瀵规瘮鍒嗘瀽

## 馃搳 椤圭洰瀵规瘮

### 1锔忊儯 Lucky 椤圭洰 鉁?(娴嬭瘯缃戝伐浣滄甯?

**SDK 鍔犺浇鏂瑰紡**: CDN 鍔ㄦ€佸姞杞?- SDK URL: https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.umd.cjs
- 鍔犺浇鏂瑰紡: 鍔ㄦ€佸垱寤?<script> 鏍囩娉ㄥ叆鍒?DOM
- SDK 浣嶇疆: window.relayerSDK
- 閰嶇疆鏉ユ簮: window.relayerSDK.SepoliaConfig

**浼樼偣**:
鉁?SDK 浠庡畼鏂?CDN 鍔犺浇锛屽缁堟槸鏈€鏂扮殑绋冲畾鐗堟湰
鉁?SepoliaConfig 鍖呭惈瀹屾暣鐨勯粯璁ら厤缃?鉁?涓嶉渶瑕佹墜鍔ㄦ寚瀹?relayerUrl/gatewayUrl

---

### 2锔忊儯 Arcane-vote 椤圭洰 鉁?(娴嬭瘯缃戝伐浣滄甯?

**FHEVM 浣跨敤**: 涓嶄娇鐢?Relayer SDK锛?- 渚濊禆: @fhevm/solidity, encrypted-types
- 宸ヤ綔鏂瑰紡: 鍙娇鐢ㄥ鎴风鍔犲瘑搴擄紝涓嶈繛鎺?Relayer/Gateway
- RPC: 纭紪鐮?Infura (https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990)

**浼樼偣**:
鉁?涓嶄緷璧?Zama 鐨?Relayer/Gateway 鏈嶅姟
鉁?鏇寸畝鍗曪紝鍑忓皯澶栭儴渚濊禆
鉁?鍙渶瑕?RPC 杩炴帴

---

### 3锔忊儯 Private-poll 椤圭洰 鉂?(娴嬭瘯缃戣繛鎺ュけ璐?

**SDK 鍔犺浇鏂瑰紡**: NPM 鍖呯洿鎺ュ鍏?- 鍖? @zama-fhe/relayer-sdk": "0.2.0"
- 瀵煎叆: import { createInstance, SepoliaConfig }
- 璋冪敤: createInstance({ ...SepoliaConfig, network, relayerUrl })

**闂**:
鉂?NPM 鍖呯増鏈彲鑳戒笌鏈嶅姟绔笉鍖归厤
鉂?鎵嬪姩鎸囧畾 relayerUrl 鍙兘涓?SepoliaConfig 鍐茬獊
鉂?Relayer 绔偣涓嶇ǔ瀹?(杩斿洖 Bad JSON)

---

## 馃幆 鍏抽敭宸紓鎬荤粨

| 椤圭洰 | SDK 鏉ユ簮 | 閰嶇疆鏂瑰紡 | Relayer 杩炴帴 | 鐘舵€?|
|------|---------|---------|-------------|------|
| Lucky | CDN | 鑷姩 (window.relayerSDK) | 闇€瑕?| 鉁?姝ｅ父 |
| Arcane-vote | 鏃?| 鏃犻渶 | 涓嶉渶瑕?| 鉁?姝ｅ父 |
| Private-poll | NPM | 鎵嬪姩 | 闇€瑕?| 鉂?澶辫触 |

---

## 馃挕 闂鏍规簮

Private-poll 鐨勯棶棰樺湪浜?
1. 浣跨敤 NPM 鍖呭鍏ワ紝鍙兘涓?CDN 鐗堟湰琛屼负涓嶄竴鑷?2. 鎵嬪姩閰嶇疆 relayerUrl 涓?SepoliaConfig 鐨勯粯璁ら厤缃彲鑳藉啿绐?3. Relayer 鏈嶅姟鏈韩涓嶇ǔ瀹?(ERR_CONNECTION_CLOSED, Bad JSON)

Lucky 鑳藉伐浣滅殑鍘熷洜:
1. CDN 鍔犺浇纭繚 SDK 鐗堟湰涓庢湇鍔＄鍖归厤
2. 浣跨敤 window.relayerSDK.SepoliaConfig 鑾峰彇瀹屾暣鐨勯粯璁ら厤缃?3. 涓嶉渶瑕佹墜鍔ㄦ寚瀹氫换浣?URL

