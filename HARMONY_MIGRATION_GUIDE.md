# OP-Field 跨平台移植开发文档 (Web to HarmonyOS)

## 1. 核心技术栈对比与选型
实现 1:1 还原的关键在于将 Web 的声明式 UI 映射到 HarmonyOS 的 **ArkUI** 框架。

| 功能模块 | Web 原型 (当前) | HarmonyOS 实现 | 备注 |
| :--- | :--- | :--- | :--- |
| **开发语言** | TypeScript (React) | **ArkTS** | ArkTS 是 TS 的超集，转换成本极低。 |
| **UI 框架** | Tailwind CSS + React | **ArkUI (声明式 UI)** | ArkUI 的布局逻辑（Row/Column）与 Web 类似。 |
| **动画引擎** | CSS Animations / SVG | **ArkUI Animation + Canvas** | 磁带卷轴旋转需使用 ArkUI 的 `rotate` 属性。 |
| **音频引擎** | Tone.js (Web Audio API) | **OHOS Audio Renderer / OHAudio** | 核心重难点，需处理底层音频 Buffer。 |
| **状态管理** | React `useState` / `useEffect` | **@State / @Watch / @Link** | 鸿蒙原生的状态管理更高效。 |

---

## 2. UI/UX 1:1 还原策略

### 2.1 布局映射 (Layout Mapping)
当前 Web 版使用的是 `flex` 布局，ArkUI 提供了完美的对应关系：
- `flex flex-col` → `Column()`
- `flex flex-row` → `Row()`
- `grid grid-cols-2` → `Grid()` 或嵌套 `Row()`
- **绝对定位**：鸿蒙中使用 `.position({ x: ..., y: ... })` 配合 `ZStack()`。

### 2.2 精准视觉还原
- **颜色系统**：直接复用十六进制颜色（如 `#eeeeee`, `#4fbefd`）。
- **圆角与阴影**：
  - Web: `rounded-[48px] shadow-2xl`
  - HarmonyOS: `.borderRadius(48).shadow({ radius: 80, color: '#000000', offsetY: 40 })`
- **电子显示屏 (Display.tsx)**：
  - **HarmonyOS 方案**：使用 **Canvas 组件** 配合 `CanvasRenderingContext2D` 进行绘制，保持 400x200 的逻辑比例。

---

## 3. 功能开发指南 (ArkTS 代码示例)

### 3.1 旋钮组件 (Knob.tsx 移植)
```typescript
@Component
struct Knob {
  @State angle: number = 0
  @Prop color: string
  
  build() {
    Stack() {
      Circle()
        .width(60)
        .height(60)
        .fill('#222')
      Rect()
        .width(4)
        .height(20)
        .fill(this.color)
        .position({ x: 28, y: 5 })
    }
    .rotate({ angle: this.angle })
    .gesture(
      PanGesture()
        .onActionUpdate((event: GestureEvent) => {
          // 旋钮逻辑算法：this.angle += event.offsetX
        })
    )
  }
}
```

### 3.2 磁带动画 (Display 移植)
```typescript
Image($r('app.media.reel'))
  .rotate({ angle: this.rotationAngle })
  .animation({
    duration: 2000 / this.tapeSpeed,
    curve: Curve.Linear,
    iterations: -1
  })
```

---

## 4. 音频引擎移植 (核心架构)
由于 `Tone.js` 无法直接运行，需重写音频层：
1. **渲染层**：使用 `@ohos.multimedia.audio.AudioRenderer`。
2. **合成层**：使用 C++ (OpenSL ES/OHAudio) 或 ArkTS 实现波形算法（正弦、锯齿、FM）。
3. **录音层**：使用 `AudioCapturer` 获取原始 PCM 数据并保存为 Buffer。

---

## 5. 移植 Roadmap (分步计划)

1. **环境准备**：安装 DevEco Studio，配置 API 12+ 项目。
2. **资源迁移**：由于 Web 使用的是 Emoji 和 SVG，在鸿蒙中建议替换为高性能的矢量图标。
3. **UI 原型实现**：先还原 `App.tsx` 中的顶层结构（Mode Selector, Display Area, Knob Grid）。
4. **状态同步**：将 React 的 `params` 对象映射为 ArkTS 的 `@State` 对象。
5. **音频系统联调**：将 UI 操作关联到鸿蒙音频驱动。

---

## 6. 注意事项
- **输入延迟**：鸿蒙中的手势反应极快，对于旋钮操作需做简单的防抖处理。
- **性能优化**：Canvas 波形在高帧率下可能产生功耗，建议在磁带不工作时停止 Canvas 刷新。
