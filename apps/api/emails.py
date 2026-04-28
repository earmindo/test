import resend
from config import settings

resend.api_key = settings.resend_api_key

FROM = "MusicAI <hello@musicai.app>"


def _send(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key:
        return
    resend.Emails.send({"from": FROM, "to": to, "subject": subject, "html": html})


def send_welcome(email: str, name: str | None) -> None:
    first = name.split()[0] if name else "there"
    _send(
        to=email,
        subject="Welcome to MusicAI 🎵",
        html=f"""
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
          <h1 style="color:#4f46e5">Welcome, {first}!</h1>
          <p>Your MusicAI account is ready. You get <strong>3 free generations per day</strong> to start.</p>
          <p>Just describe the music you imagine and our AI will create it in seconds.</p>
          <a href="{settings.app_url}/dashboard"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
            Start generating →
          </a>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#888;font-size:13px">
            Need help? Reply to this email or visit
            <a href="{settings.app_url}" style="color:#4f46e5">musicai.app</a>
          </p>
        </div>
        """,
    )


def send_generation_complete(email: str, prompt: str, audio_url: str) -> None:
    short_prompt = (prompt[:60] + "…") if len(prompt) > 60 else prompt
    _send(
        to=email,
        subject="Your music is ready 🎶",
        html=f"""
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
          <h2 style="color:#4f46e5">Your track is ready</h2>
          <p style="color:#555;font-style:italic">"{short_prompt}"</p>
          <a href="{settings.app_url}/dashboard"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
            Listen now →
          </a>
          <p style="font-size:13px;color:#888">
            Or <a href="{audio_url}" style="color:#4f46e5">download directly</a>.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#aaa;font-size:12px">
            <a href="{settings.app_url}/settings" style="color:#aaa">Manage email preferences</a>
          </p>
        </div>
        """,
    )


def send_subscription_confirmed(email: str, plan: str) -> None:
    _send(
        to=email,
        subject=f"You're now on the {plan.capitalize()} plan 🚀",
        html=f"""
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#111">
          <h2 style="color:#4f46e5">{plan.capitalize()} plan activated</h2>
          <p>Thanks for upgrading! You now have access to all {plan.capitalize()} features:</p>
          {"<ul><li>Unlimited generations</li><li>Up to 120s per track</li><li>WAV + FLAC formats</li></ul>" if plan == "pro" else
           "<ul><li>Unlimited generations</li><li>Up to 120s per track</li><li>All formats</li><li>Separate stems</li><li>Commercial use license</li><li>API access</li></ul>"}
          <a href="{settings.app_url}/dashboard"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
            Start creating →
          </a>
          <p style="font-size:13px;color:#888">
            Manage your subscription in <a href="{settings.app_url}/settings" style="color:#4f46e5">Settings</a>.
          </p>
        </div>
        """,
    )
