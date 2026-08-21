# sample-virtual-museum


https://github.com/user-attachments/assets/1bf4b663-5af4-4b1c-9ab2-ebd330a65ce0

バーチャルミュージアムのサンプルプログラムです。
起動して複数のブラウザで開くと、ワールド内のお互いのアバターの位置や向きが共有され表示されます。
ワールド内には、京都コンピュータ学院京都駅前校1Fのコンピュータミュージアムを3Dスキャンしたデータを配置してあります。

# 実行方法

実行するには、nodejs(v24)が必要です。このリポジトリをcloneし、以下のコマンドでパッケージのインストールと実行を行ってください。

```
# clone
git clone https://github.com/kcg-edu-future-lab/sample-virtual-museum
# パッケージのインストール
npm i
# 実行(ブラウザが開きます)
npm run dev
```

### 実装されている機能

- iPhoneで3Dスキャンしたデータの表示
- WASDキーでの移動、マウスでの角度変更
  - 画面クリックでキーボードとマウスをキャプチャします。ESCキーで抜けます。
- チャット
  - 右側のパネルのChatタブで、発言の送信と表示
- 3Dシーン内のオブジェクトの説明表示
  - ワイヤー表示されている箱(InfoObject)に視点を近づけると、右側のパネルに説明が表示されます
  - 右側のパネルの歯車のタブで、InfoObjectの追加削除、移動、拡大縮小が可能です。URLに、説明として表示されるページを設定

### 技術スタック

- 基盤技術
  - [TypeScript](https://www.typescriptlang.org/ja/), [React.js](https://ja.react.dev/) , [Vite](tps://ja.vite.dev/)
- 3D表示
  - [ThreeJS](https://github.com/mrdoob/three.js/), [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei)
- 通信・情報同期
  - [Madoi](https://github.com/kcg-edu-future-lab/madoi)
