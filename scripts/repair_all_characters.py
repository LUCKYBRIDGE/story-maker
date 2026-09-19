import os
import glob
from PIL import Image
import numpy as np
from collections import deque

asset_dir = "/Volumes/WAN2/apps/story-maker/public/story-assets"
dist_dir = "/Volumes/WAN2/apps/story-maker/dist/client/story-assets"
out_dir = "/Volumes/WAN2/apps/story-maker/out/story-assets"

def get_floodfill_bg(arr, bg_thresh=24.0):
    h, w, _ = arr.shape
    corners = np.concatenate([
        arr[:25, :25],
        arr[:25, -25:],
        arr[-25:, :25],
        arr[-25:, -25:]
    ], axis=0)
    bg_color = np.mean(corners, axis=(0, 1))
    diff = np.sqrt(np.sum((arr - bg_color) ** 2, axis=2))

    is_bg_candidate = diff < bg_thresh
    visited_bg = np.zeros((h, w), dtype=bool)
    q = deque()

    for y in range(h):
        for x in (0, w - 1):
            if is_bg_candidate[y, x] and not visited_bg[y, x]:
                visited_bg[y, x] = True
                q.append((y, x))
    for x in range(w):
        for y in (0, h - 1):
            if is_bg_candidate[y, x] and not visited_bg[y, x]:
                visited_bg[y, x] = True
                q.append((y, x))

    while q:
        cy, cx = q.popleft()
        for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
            if 0 <= ny < h and 0 <= nx < w:
                if not visited_bg[ny, nx] and is_bg_candidate[ny, nx]:
                    visited_bg[ny, nx] = True
                    q.append((ny, nx))

    return visited_bg, diff, bg_thresh

def apply_antialiasing_1px(alpha, visited_bg, diff, bg_thresh):
    visited_dilated = (
        visited_bg |
        np.pad(visited_bg[1:, :], ((0, 1), (0, 0)), constant_values=False) |
        np.pad(visited_bg[:-1, :], ((1, 0), (0, 0)), constant_values=False) |
        np.pad(visited_bg[:, 1:], ((0, 0), (0, 1)), constant_values=False) |
        np.pad(visited_bg[:, :-1], ((0, 0), (1, 0)), constant_values=False)
    )
    border_mask = visited_dilated & (~visited_bg)
    for y, x in np.argwhere(border_mask):
        if diff[y, x] < bg_thresh + 12.0:
            factor = (diff[y, x] - bg_thresh) / 12.0
            factor = max(0.2, min(1.0, factor))
            alpha[y, x] = int(factor * 255)

def assemble_canvas(cropped_rgba, target_height, ground_y=1149, max_width=720):
    crop_w, crop_h = cropped_rgba.size
    scale = min(target_height / crop_h, max_width / crop_w)
    new_w = int(round(crop_w * scale))
    new_h = int(round(crop_h * scale))
    resized = cropped_rgba.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (800, 1200), (0, 0, 0, 0))
    top = ground_y - new_h + 1
    left = int(round((800 - new_w) / 2))
    canvas.paste(resized, (left, top), resized)
    return canvas

def sync_to_dirs(filename, canvas):
    targets = [
        os.path.join(asset_dir, filename),
        os.path.join(dist_dir, filename),
        os.path.join(out_dir, filename),
    ]
    for t in targets:
        if os.path.exists(os.path.dirname(t)):
            canvas.save(t, "WEBP", lossless=True, quality=100)

def process_15_samples():
    print("--- Processing 15 sample-based characters ---")
    
    samples = [
        {"id": "heungbu.character.heungbu-default", "file": "heungbu-sample.jpg", "h": 1000},
        {"id": "heungbu.character.heungbu-young", "file": "heungbu-young-sample.jpg", "h": 900},
        {"id": "heungbu.character.nolbu-default", "file": "nolbu-sample.jpg", "h": 1000},
        {"id": "heungbu.character.nolbu-young", "file": "nolbu-young-sample.jpg", "h": 910},
        {"id": "heungbu.character.wife-heungbu", "file": "heungbu-wife-sample.jpg", "h": 949},
        {"id": "heungbu.character.wife-nolbu", "file": "nolbu-wife-sample.jpg", "h": 960},
        {"id": "heungbu.character.heungbu-pleading", "file": "heungbu-pleading-sample.jpg", "h": 1000, "floor_line": True},
        {"id": "heungbu.character.heungbu-happy", "file": "heungbu-happy-sample.jpg", "h": 1000},
        {"id": "heungbu.character.nolbu-angry", "file": "nolbu-angry-sample.jpg", "h": 1000, "floor_wood": True},
        {"id": "heungbu.character.nolbu-remorse", "file": "nolbu-remorse-sample.jpg", "h": 1000},
        {"id": "heungbu.character.wife-heungbu-worried", "file": "heungbu-wife-worried-sample.jpg", "h": 950},
        {"id": "heungbu.character.wife-nolbu-shocked", "file": "nolbu-wife-shocked-sample.jpg", "h": 960, "floor_line": True},
        {"id": "heungbu.character.children", "file": "heungbu-children-sample.jpg", "h": 880, "floor_debris": True},
        {"id": "heungbu.character.swallow", "file": "heungbu-swallow-sample.jpg", "h": 900, "swallow": True},
        {"id": "heungbu.character.neighbor", "file": "heungbu-neighbor-sample.jpg", "h": 1000},
    ]

    for s in samples:
        src_path = os.path.join(asset_dir, s["file"])
        img = Image.open(src_path).convert('RGB')
        w, h = img.size
        arr = np.array(img, dtype=np.float32)

        thresh = 30.0 if s.get("swallow") else 24.0
        visited_bg, diff, bg_thresh = get_floodfill_bg(arr, thresh)

        # 바닥 특수 처리
        if s.get("floor_wood"): # nolbu-angry
            is_floor = np.zeros((h, w), dtype=bool)
            is_floor[968:, :] = True
            for y in range(870, 968):
                for x in range(w):
                    if x < 320 or x > 720:
                        is_floor[y, x] = True
                    r, g, b = arr[y, x]
                    brightness = (r + g + b) / 3.0
                    if (r > b + 18) and (r > 75) and (85 <= brightness < 160):
                        is_floor[y, x] = True
            for y in range(915, 928):
                for x in range(w):
                    if x < 325 or x > 715:
                        is_floor[y, x] = True

            # 플러드필 재실행 (is_floor 포함)
            is_bg_candidate = (diff < bg_thresh) | is_floor
            visited_bg = np.zeros((h, w), dtype=bool)
            q = deque()
            for y in range(h):
                for x in (0, w - 1):
                    if is_bg_candidate[y, x] and not visited_bg[y, x]:
                        visited_bg[y, x] = True
                        q.append((y, x))
            for x in range(w):
                for y in (0, h - 1):
                    if is_bg_candidate[y, x] and not visited_bg[y, x]:
                        visited_bg[y, x] = True
                        q.append((y, x))
            while q:
                cy, cx = q.popleft()
                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w:
                        if not visited_bg[ny, nx] and is_bg_candidate[ny, nx]:
                            visited_bg[ny, nx] = True
                            q.append((ny, nx))

        if s.get("floor_line"): # heungbu-pleading, wife-nolbu-shocked
            for y in range(int(h * 0.85), h - 5):
                row_dark = (arr[y, :, 0] < 190) & (arr[y, :, 1] < 190) & (arr[y, :, 2] < 190)
                if np.sum(row_dark[:int(w*0.3)]) > 5 or np.sum(row_dark[int(w*0.7):]) > 5:
                    for x in list(range(0, int(w*0.37))) + list(range(int(w*0.63), w)):
                        if row_dark[x]:
                            visited_bg[max(0, y-2):min(h, y+3), x] = True

        if s.get("floor_debris"): # children
            for y in range(int(h * 0.90), h):
                visited_bg[y, :int(w*0.25)] = True
                visited_bg[y, int(w*0.75):] = True

        alpha = np.ones((h, w), dtype=np.uint8) * 255
        alpha[visited_bg] = 0

        # 외곽 경계선 1px만 안티앨리어싱
        apply_antialiasing_1px(alpha, visited_bg, diff, bg_thresh)

        # Crop
        coords = np.argwhere(alpha > 20)
        ymin, xmin = coords.min(axis=0)
        ymax, xmax = coords.max(axis=0)

        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        rgba[:, :, :3] = np.array(img)
        rgba[:, :, 3] = alpha

        cropped = Image.fromarray(rgba).crop((xmin, ymin, xmax + 1, ymax + 1))
        canvas = assemble_canvas(cropped, s["h"])

        # public, dist, out 모두 동기화 저장
        sync_to_dirs(f"{s['id']}.webp", canvas)
        print(f"Synced: {s['id']}.webp (height={s['h']})")

def process_10_webps():
    print("\n--- Processing 10 WebP characters (Hole Restoration & Artifact Cleanup) ---")
    
    webps = [
        {"id": "heungbu.character.heungbu-thinking", "h": 998},
        {"id": "heungbu.character.heungbu-working", "h": 1001, "clean_ground_left": True},
        {"id": "heungbu.character.heungbu-swallow-care", "h": 1001},
        {"id": "heungbu.character.heungbu-gourd-saw", "h": 956, "clean_ground_saw": True},
        {"id": "heungbu.character.heungbu-sharing", "h": 998},
        {"id": "heungbu.character.nolbu-thinking", "h": 1001},
        {"id": "heungbu.character.nolbu-swallow-holding", "h": 998},
        {"id": "heungbu.character.nolbu-ruined-seated", "h": 758, "clean_ground_seated": True},
        {"id": "heungbu.character.nolbu-working", "h": 1031, "clean_ground_work": True},
        {"id": "heungbu.character.nolbu-sharing", "h": 999},
    ]

    for item in webps:
        path = os.path.join(asset_dir, f"{item['id']}.webp")
        img = Image.open(path).convert('RGBA')
        w, h = img.size
        arr = np.array(img)
        alpha = arr[:, :, 3]

        visited_bg = np.zeros((h, w), dtype=bool)
        q = deque()
        for y in range(h):
            for x in (0, w - 1):
                if alpha[y, x] < 50 and not visited_bg[y, x]:
                    visited_bg[y, x] = True
                    q.append((y, x))
        for x in range(w):
            for y in (0, h - 1):
                if alpha[y, x] < 50 and not visited_bg[y, x]:
                    visited_bg[y, x] = True
                    q.append((y, x))

        while q:
            cy, cx = q.popleft()
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < h and 0 <= nx < w:
                    if not visited_bg[ny, nx] and alpha[ny, nx] < 50:
                        visited_bg[ny, nx] = True
                        q.append((ny, nx))

        # 바닥 잔여물 마스킹
        if item.get("clean_ground_saw"): # heungbu-gourd-saw
            visited_bg[1150:, :] = True
            visited_bg[1120:1150, :150] = True
            visited_bg[1120:1150, 680:] = True

        if item.get("clean_ground_work"): # nolbu-working
            visited_bg[1150:, :] = True
            visited_bg[1120:1150, :180] = True
            visited_bg[1120:1150, 680:] = True

        if item.get("clean_ground_left"): # heungbu-working
            visited_bg[1150:, :] = True
            visited_bg[1120:1150, :200] = True

        if item.get("clean_ground_seated"): # nolbu-ruined-seated
            visited_bg[1150:, :] = True
            visited_bg[1120:1150, 650:] = True

        visited_dilated = (
            visited_bg |
            np.pad(visited_bg[1:, :], ((0, 1), (0, 0)), constant_values=False) |
            np.pad(visited_bg[:-1, :], ((1, 0), (0, 0)), constant_values=False) |
            np.pad(visited_bg[:, 1:], ((0, 0), (0, 1)), constant_values=False) |
            np.pad(visited_bg[:, :-1], ((0, 0), (1, 0)), constant_values=False)
        )
        is_inner = (~visited_bg) & (~visited_dilated)
        
        arr[is_inner, 3] = 255
        arr[visited_bg, 3] = 0
        arr[1150:, :, 3] = 0

        res_img = Image.fromarray(arr)
        sync_to_dirs(f"{item['id']}.webp", res_img)
        print(f"Synced & Restored: {item['id']}.webp")

if __name__ == "__main__":
    process_15_samples()
    process_10_webps()
    print("\nAll 25 assets successfully processed and synced across public/, dist/, and out/!")
