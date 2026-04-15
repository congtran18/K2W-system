"""
K2W Image Generator — SD 1.5 + LCM (FASTEST free CPU)
POST /generate {"prompt": "...", "width": 512, "height": 512}
Returns: {"url": "data:image/png;base64,..."}
~5-15 seconds per image on CPU
"""
import os, io, base64, torch
from flask import Flask, request, jsonify
from diffusers import StableDiffusionPipeline, LCMScheduler, AutoencoderTiny

app = Flask(__name__)

print("Loading SD 1.5 + LCM (ultra-fast CPU)...")
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float32,
    safety_checker=None,
)
pipe.scheduler = LCMScheduler.from_config(pipe.scheduler.config)
pipe.load_lora_weights("latent-consistency/lcm-lora-sdv1-5")
pipe.fuse_lora()
try:
    pipe.vae = AutoencoderTiny.from_pretrained("madebyollin/taesd", torch_dtype=torch.float32)
    print("✅ Tiny VAE loaded!")
except:
    print("⚠️ Tiny VAE failed")
pipe.to("cpu")
print("✅ SD 1.5 LCM ready! (~5-15s/image)")

@app.route("/health")
def health():
    return jsonify({"status": "ok", "model": "SD-1.5-LCM"})

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    prompt = data.get("prompt", "")
    width = data.get("width", 512)
    height = data.get("height", 512)
    full_prompt = f"{prompt}, high quality, professional photography"
    print(f"Generate: {prompt[:50]}...")
    try:
        image = pipe(full_prompt, num_inference_steps=1, guidance_scale=0.0, width=width, height=height).images[0]
        buf = io.BytesIO()
        image.save(buf, format="PNG")
        buf.seek(0)
        b64 = base64.b64encode(buf.read()).decode("utf-8")
        print(f"✅ Done")
        return jsonify({"url": f"data:image/png;base64,{b64}", "width": width, "height": height})
    except Exception as e:
        print(f"❌ {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)
