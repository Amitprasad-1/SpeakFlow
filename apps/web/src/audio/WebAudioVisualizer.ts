export class WebAudioVisualizer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isSimulating = false;
  private simTime = 0;

  public attachCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
  }

  public setAnalyser(analyser: AnalyserNode | null): void {
    this.analyser = analyser;
    if (analyser) {
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isSimulating = false;
    } else {
      this.dataArray = null;
    }
  }

  public startSimulation(active: boolean = true): void {
    this.isSimulating = active;
  }

  public startRendering(theme: 'dark' | 'light' = 'dark'): void {
    if (this.animationFrameId) return;

    const render = () => {
      this.drawFrame(theme);
      this.animationFrameId = requestAnimationFrame(render);
    };

    render();
  }

  public stopRendering(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.clearCanvas();
  }

  private resizeCanvas(): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
    }
  }

  private clearCanvas(): void {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawFrame(theme: 'dark' | 'light'): void {
    if (!this.ctx || !this.canvas) return;
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.ctx.clearRect(0, 0, width, height);

    const primaryColor = theme === 'dark' ? '#10b981' : '#0d9488';
    const secondaryColor = theme === 'dark' ? '#6366f1' : '#4f46e5';

    if (this.analyser && this.dataArray) {
      // Real microphone data: draw frequency bars
      this.analyser.getByteFrequencyData(this.dataArray as any);

      const bufferLength = this.dataArray.length;
      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (this.dataArray[i] / 255) * (height * 0.85);

        const gradient = this.ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, secondaryColor);

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(x, height - barHeight, Math.max(2, barWidth - 2), barHeight, [4, 4, 0, 0]);
        this.ctx.fill();

        x += barWidth;
      }
    } else {
      // Idle or simulated pulse wave
      this.simTime += 0.04;
      const amplitude = this.isSimulating ? height * 0.35 : height * 0.08;

      this.ctx.beginPath();
      this.ctx.lineWidth = 3;
      this.ctx.strokeStyle = primaryColor;

      for (let x = 0; x < width; x += 3) {
        const slice = (x / width) * Math.PI * 4;
        const y = height / 2 + Math.sin(slice + this.simTime) * amplitude * Math.sin(this.simTime * 0.5);
        if (x === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      this.ctx.stroke();
    }
  }

  public dispose(): void {
    this.stopRendering();
    this.canvas = null;
    this.ctx = null;
    this.analyser = null;
  }
}
