import type { AppContext, Screen } from '@/app/context';
import type { RegionChoice, RegionId } from '@/core/types';
import { REGION_IDS, REGIONS, resolveRegion } from '@/core/regions';
import { chooseVoice, isEdge, microsoftVoices, voiceRegion } from '@/services/voices';
import { bi, el, esc, q, qa } from '../dom';
import { ICONS, svg } from '../icons';
import { confirmButton } from '../components/confirmButton';

const PREVIEW_TEXT: Record<RegionId, string> = {
  AT: 'Servus! Treffen wir uns um viertel acht? Meine Nummer ist null sechs sechs vier, zwölf, vierunddreißig, sechsundfünfzig.',
  DE: 'Hallo! Treffen wir uns um Viertel nach sieben? Meine Nummer ist null eins sieben eins, zwölf, vierunddreißig, sechsundfünfzig.',
  CH: 'Grüezi! Treffen wir uns um Viertel nach sieben? Meine Natelnummer ist null sieben neun, hundertdreiundzwanzig, fünfundvierzig, siebenundsechzig.',
};

/** Region, voice, speed, options, high score reset and the sentence overview. */
export class SettingsScreen implements Screen {
  readonly root = el(`
    <section class="screen screen--split screen--settings" hidden>
      <button class="btn btn--back screen__full" type="button" data-ref="back">${svg(ICONS.back)} Zurück</button>
      <div class="col">
        <div class="card">
          <h2>Aussprache <span class="zh">发音</span></h2>
          <div class="field">
            <span class="field__label">Region <span class="zh">地区说法</span></span>
            <div class="segmented segmented--wrap" data-ref="region">
              ${REGION_IDS.map((id) => `<button type="button" data-region="${id}">${REGIONS[id].name}</button>`).join('')}
              <button type="button" data-region="mix">Gemischt</button>
            </div>
            <p class="note">Bestimmt Formulierungen, Telefonnummern und Währung, z. B. „viertel acht", „Jänner", „zwo" oder Franken und Rappen.</p>
          </div>
          <div class="field">
            <label class="field__label" for="voice-select">Stimme <span class="zh">声音</span></label>
            <select id="voice-select" data-ref="voice"></select>
            <div class="preview">
              <button class="btn btn--ghost btn--small" type="button" data-ref="preview" aria-live="polite"></button>
              <span class="note" data-ref="previewInfo"></span>
            </div>
            <p class="note" data-ref="voiceStatus">Stimmen werden geladen …</p>
          </div>
          <div class="field">
            <label class="field__label" for="rate-input">Grundtempo <span class="zh">语速</span></label>
            <input type="range" id="rate-input" data-ref="rate" min="0.7" max="1.3" step="0.05">
            <div class="range-labels"><span>langsam</span><b data-ref="rateValue"></b><span>schnell</span></div>
          </div>
        </div>
        <div class="card">
          <h2>Bestenliste <span class="zh">最高分</span></h2>
          <div class="split-row"><span class="note">Nur in diesem Browser gespeichert.</span><button class="btn btn--danger" type="button" data-ref="clear">Bestenliste löschen</button></div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <h2>Optionen <span class="zh">选项</span></h2>
          <div class="option-grid">
            <label class="toggle"><input type="checkbox" data-setting="soundEffects"> <span>${bi('Soundeffekte', '音效')}</span></label>
            <label class="toggle"><input type="checkbox" data-setting="sentences"> <span>${bi('Ganze Sätze statt nur der Zahl', '用完整句子')}</span></label>
            <label class="toggle"><input type="checkbox" data-setting="noise"> <span>${bi('Hintergrundrauschen wie am Bahnhof', '背景噪音')}</span></label>
            <label class="toggle"><input type="checkbox" data-setting="chinese"> <span>${bi('Chinesische Hinweise', '中文提示')}</span></label>
          </div>
        </div>
        <div class="card">
          <h2>Satzvorrat <span class="zh">句子库</span></h2>
          <div class="table-wrap"><table class="stock" data-ref="stock"></table></div>
          <p class="note" data-ref="stockNote"></p>
        </div>
      </div>
    </section>`);

  private previewing = false;
  private readonly ref = <T extends HTMLElement = HTMLElement>(name: string) =>
    q<T>(this.root, `[data-ref="${name}"]`);

  constructor(
    private readonly ctx: AppContext,
    onBack: () => void,
  ) {
    const s = ctx.settings;
    this.ref('back').addEventListener('click', onBack);
    this.ref('region').addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLElement>('[data-region]');
      if (b) s.set('region', b.dataset.region as RegionChoice);
    });
    this.ref<HTMLSelectElement>('voice').addEventListener('change', (e) =>
      s.set('voice', (e.target as HTMLSelectElement).value),
    );
    this.ref<HTMLInputElement>('rate').addEventListener('input', (e) =>
      s.set('rate', +(e.target as HTMLInputElement).value),
    );
    qa<HTMLInputElement>(this.root, '[data-setting]').forEach((box) =>
      box.addEventListener('change', () => {
        const key = box.dataset.setting as 'soundEffects' | 'sentences' | 'noise' | 'chinese';
        s.set(key, box.checked);
        if (key === 'soundEffects' && box.checked) ctx.sound('ok');
      }),
    );
    this.ref('preview').addEventListener('click', () => this.togglePreview());
    confirmButton(
      this.ref<HTMLButtonElement>('clear'),
      { idle: 'Bestenliste löschen', armed: 'Wirklich löschen? Nochmal tippen.', done: 'Gelöscht' },
      () => ctx.highscores.clear(),
    );
    ctx.speech.onVoicesChanged(() => this.renderVoices());
    s.subscribe(() => this.renderValues());
    this.setPreview(false);
    this.renderVoices();
    this.renderValues();
  }

  enter(): void {
    this.renderValues();
    this.renderStock();
  }

  leave(): void {
    if (this.previewing) {
      this.ctx.stopSpeaking();
      this.setPreview(false);
    }
  }

  private renderValues(): void {
    const s = this.ctx.settings.current;
    qa(this.ref('region'), '[data-region]').forEach((b) =>
      b.setAttribute('aria-pressed', String(b.dataset.region === s.region)),
    );
    this.ref<HTMLInputElement>('rate').value = String(s.rate);
    this.ref('rateValue').textContent = s.rate.toFixed(2) + '×';
    qa<HTMLInputElement>(this.root, '[data-setting]').forEach((box) => {
      box.checked = Boolean(s[box.dataset.setting as keyof typeof s]);
    });
    const select = this.ref<HTMLSelectElement>('voice');
    select.value = [...select.options].some((o) => o.value === s.voice) ? s.voice : 'auto';
  }

  private renderVoices(): void {
    const { speech } = this.ctx;
    const voices = speech.voices;
    const groups: Record<RegionId, SpeechSynthesisVoice[]> = { AT: [], DE: [], CH: [] };
    voices.forEach((v) => groups[voiceRegion(v)].push(v));
    let html =
      '<option value="auto">Automatisch, passend zur Region</option><option value="random">Zufällig, alle deutschen Stimmen</option>';
    const ms = microsoftVoices(voices);
    if (isEdge() && ms.length)
      html += `<option value="microsoft">Alle Microsoft-Stimmen, zufällig (${ms.length})</option>`;
    for (const id of ['AT', 'DE', 'CH'] as const) {
      if (!groups[id].length) continue;
      html += `<optgroup label="${REGIONS[id].name} (de-${id})">${groups[id].map((v) => `<option value="${esc(v.voiceURI)}">${esc(v.name)}</option>`).join('')}</optgroup>`;
    }
    this.ref('voice').innerHTML = html;
    this.renderValues();

    const status = this.ref('voiceStatus');
    if (!speech.supported)
      status.textContent =
        'Dieser Browser hat keine Sprachausgabe. Öffne die Seite in Edge, Chrome oder Safari.';
    else if (!voices.length) {
      status.textContent =
        'Keine deutsche Stimme gefunden. Installiere eine deutsche Sprachausgabe im System oder nutze Microsoft Edge.';
    } else {
      let t = `Gefunden: ${groups.AT.length} österreichische, ${groups.DE.length} deutsche, ${groups.CH.length} Schweizer Stimme${voices.length === 1 ? '' : 'n'}.`;
      if (!groups.AT.length) t += ' Österreichische Stimmen (Ingrid, Jonas) gibt es z. B. in Microsoft Edge.';
      status.textContent = t;
    }
  }

  private togglePreview(): void {
    if (this.previewing) {
      this.ctx.stopSpeaking();
      this.setPreview(false);
      return;
    }
    const s = this.ctx.settings.current;
    const region = resolveRegion(s.region);
    const voice = chooseVoice(this.ctx.speech.voices, region, s.voice);
    const textRegion = voice ? voiceRegion(voice) : region;
    this.setPreview(true);
    this.ctx.say(
      PREVIEW_TEXT[textRegion],
      { voiceURI: voice?.voiceURI ?? null, rate: s.rate, pitch: 1 },
      () => this.setPreview(false),
    );
    this.ref('previewInfo').textContent = voice
      ? `${voice.name} (${voice.lang})`
      : 'Standardstimme des Browsers';
  }

  private setPreview(on: boolean): void {
    this.previewing = on;
    const b = this.ref('preview');
    b.innerHTML = on
      ? `${svg(ICONS.stop)} ${bi('Stopp', '停止')}`
      : `${svg(ICONS.speakerSmall)} ${bi('Probe hören', '试听')}`;
    b.classList.toggle('is-stop', on);
  }

  /** How many sentence templates each quiz has per region. */
  private renderStock(): void {
    const all = new Set<string>();
    const rows = this.ctx.quizzes
      .map((quiz) => {
        const per = REGION_IDS.map((r) => {
          const list = quiz.sentenceBank(r);
          list.forEach((t) => all.add(t));
          return list.length;
        });
        const unique = new Set(REGION_IDS.flatMap((r) => quiz.sentenceBank(r))).size;
        return `<tr><th scope="row">${bi(quiz.label.de, quiz.label.zh)}</th>${per.map((n) => `<td>${n}</td>`).join('')}<td class="stock__total">${unique}</td></tr>`;
      })
      .join('');
    this.ref('stock').innerHTML =
      `<thead><tr><th></th>${REGION_IDS.map((r) => `<th>${r}</th>`).join('')}<th>gesamt</th></tr></thead><tbody>${rows}</tbody>`;
    const openers = new Set(REGION_IDS.flatMap((r) => REGIONS[r].openers)).size;
    this.ref('stockNote').innerHTML =
      `<b>${all.size}</b> verschiedene Sätze, dazu ${openers} kurze Einleitungen wie „Also." oder „Moment.". Die Zahlen darin werden jedes Mal neu erzeugt. <span class="zh">共 ${all.size} 个句子模板。</span>`;
  }
}
