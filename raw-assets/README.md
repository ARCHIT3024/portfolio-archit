# raw-assets — drop originals here

Put original files in this folder using the names below. Any image format is fine (jpg, png, heic, webp).
`npm run images` resizes them, converts them to AVIF/WebP, strips metadata (including GPS) and writes them to `public/images/`.
Originals in this folder are **never committed** (gitignored).

| File name | What | Aspect |
|---|---|---|
| `portrait.*` | Portrait for the hero, paper-clipped to the folder | 4:5 |
| `case-004-shelfsense-1.*` | ShelfSense camera view detecting products (phone screenshot) | 9:16 |
| `case-004-shelfsense-2.*` | ShelfSense reorder / results screen (phone screenshot) | 9:16 |
| `case-004-shelfsense-3.*` | Team photo at the hackathon (optional) | 4:3 |
| `case-003-medscript-1.*` | MedScript dashboard with editable SOAP note cards | 16:10 |
| `case-003-medscript-2.*` | MedScript live audio recording screen | 16:10 |
| `case-003-medscript-3.*` | Architecture diagram: voice → Whisper → LLM → SOAP → FHIR | 16:9 |
| `case-002-learntes-1.*` | Learntes homepage in dark mode | 16:10 |
| `case-002-learntes-2.*` | Learntes MicroLearn vertical feed | 9:16 |
| `case-002-learntes-3.*` | Learntes leaderboard or certificate verification page | 16:10 |
| `case-001-sentinel-1.*` | Pre-disaster satellite image | 1:1 |
| `case-001-sentinel-2.*` | Post-disaster image with damage-class overlay | 1:1 |
| `case-001-sentinel-3.*` | Pipeline diagram: U-Net → Siamese CNN | 16:9 |
| `history-edusphere.*` | EduSphere homepage screenshot | 16:10 |
| `resume.pdf` | Résumé (remove phone/address if they shouldn't be public) | |
| `links.md` | Fill in the template below | |

## links.md template

One `key: value` per line. URLs must start with `https://`. Leave a line out (or keep its `e.g.` value) and the
site shows the design's placeholder instead.

```md
github: e.g. https://github.com/<you>
linkedin: e.g. https://www.linkedin.com/in/<you>
shelfsense-github: e.g. https://github.com/<you>/<repo>
medscript-github: e.g. https://github.com/<you>/<repo>
medscript-huggingface: e.g. https://huggingface.co/<you>/<model>
learntes-github: e.g. https://github.com/<you>/<repo>
learntes-date: e.g. Jan – Feb 2026
learntes-aws: e.g. S3, CloudFront, Lambda
sentinel-github: e.g. https://github.com/<you>/<repo>
```
