"""Inject Morph transitions and animation timing into the pptxgenjs output."""
import json, re, sys, zipfile, shutil, os

src, dst = sys.argv[1], sys.argv[2]
spec = json.load(open(os.path.join(os.path.dirname(__file__), 'anim.json')))
ANIM, TRANS = spec['ANIM'], spec['TRANS']


class Ctr:
    def __init__(self):
        self.n = 1

    def __call__(self):
        self.n += 1
        return self.n


def tgt(spid):
    return f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'


def set_vis(c, spid, val='visible', delay=0):
    return (f'<p:set><p:cBhvr><p:cTn id="{c()}" dur="1" fill="hold"><p:stCondLst><p:cond delay="{delay}"/></p:stCondLst></p:cTn>'
            f'{tgt(spid)}<p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
            f'<p:to><p:strVal val="{val}"/></p:to></p:set>')


def anim_prop(c, spid, attr, frm, to, dur, decel=False):
    return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr additive="base"><p:cTn id="{c()}" dur="{dur}" fill="hold"/>{tgt(spid)}'
            f'<p:attrNameLst><p:attrName>{attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst>'
            f'<p:tav tm="0"><p:val><p:strVal val="{frm}"/></p:val></p:tav>'
            f'<p:tav tm="100000"><p:val><p:strVal val="{to}"/></p:val></p:tav></p:tavLst></p:anim>')


def anim_effect(c, spid, filt, dur, trans='in'):
    return f'<p:animEffect transition="{trans}" filter="{filt}"><p:cBhvr><p:cTn id="{c()}" dur="{dur}"/>{tgt(spid)}</p:cBhvr></p:animEffect>'


def rot(c, spid, by, dur, delay):
    return (f'<p:animRot by="{by}"><p:cBhvr><p:cTn id="{c()}" dur="{dur}" fill="hold"><p:stCondLst><p:cond delay="{delay}"/></p:stCondLst></p:cTn>'
            f'{tgt(spid)}<p:attrNameLst><p:attrName>r</p:attrName></p:attrNameLst></p:cBhvr></p:animRot>')


def effect(c, eff, spid, dur, node, grp):
    """Return (<p:par> xml, presetClass) for one shape."""
    cls, pid, sub = 'entr', 10, 0
    cid = c()
    body = ''
    if eff == 'fade':
        body = set_vis(c, spid) + anim_effect(c, spid, 'fade', dur)
    elif eff == 'zoom':
        pid, sub = 53, 16
        body = (set_vis(c, spid) + anim_prop(c, spid, 'ppt_w', '0', '#ppt_w', dur) + anim_prop(c, spid, 'ppt_h', '0', '#ppt_h', dur)
                + anim_effect(c, spid, 'fade', dur))
    elif eff == 'float':
        pid = 42
        body = (set_vis(c, spid) + anim_effect(c, spid, 'fade', dur) + anim_prop(c, spid, 'ppt_x', '#ppt_x', '#ppt_x', dur)
                + anim_prop(c, spid, 'ppt_y', '#ppt_y+.1', '#ppt_y', dur))
    elif eff == 'wipeL':
        pid, sub = 22, 8
        body = set_vis(c, spid) + anim_effect(c, spid, 'wipe(left)', dur)
    elif eff == 'wipeU':
        pid, sub = 22, 4
        body = set_vis(c, spid) + anim_effect(c, spid, 'wipe(up)', dur)
    elif eff == 'exitWipe':
        cls, pid, sub = 'exit', 22, 2
        body = anim_effect(c, spid, 'wipe(right)', dur, 'out') + set_vis(c, spid, 'hidden', dur - 1)
    elif eff == 'teeter':
        cls, pid = 'emph', 32
        body = (rot(c, spid, 120000, 100, 0) + rot(c, spid, -240000, 200, 100) + rot(c, spid, 240000, 200, 300)
                + rot(c, spid, -240000, 200, 500) + rot(c, spid, 120000, 100, 700))
    else:
        raise ValueError(eff)
    xml = (f'<p:par><p:cTn id="{cid}" presetID="{pid}" presetClass="{cls}" presetSubtype="{sub}" fill="hold" grpId="{grp}" nodeType="{node}">'
           f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{body}</p:childTnLst></p:cTn></p:par>')
    return xml


def build_groups(steps):
    """Split into click groups; each group: list of (offset, step, nodeType)."""
    groups = []
    for st in steps:
        if st['start'] == 'click' or not groups:
            groups.append({'auto': st['start'] != 'click', 'items': [], 'end': 0, 'lastoff': 0})
            g = groups[-1]
            off = st['delay']
            node = 'clickEffect' if st['start'] == 'click' else ('withEffect' if st['start'] == 'with' else 'afterEffect')
        else:
            g = groups[-1]
            if st['start'] == 'with':
                off = g['lastoff'] + st['delay']; node = 'withEffect'
            else:
                off = g['end'] + st['delay']; node = 'afterEffect'
        g['items'].append((off, st, node))
        g['lastoff'] = off
        g['end'] = max(g['end'], off + st['dur'])
    return groups


def group_xml(c, g, idmap, grpof, first_auto):
    # inner pars keyed by offset
    offs = sorted(set(o for o, _, _ in g['items']))
    outer_id = c()
    inner = ''
    for o in offs:
        inner_id = c()
        effs = ''
        for off, st, node in g['items']:
            if off != o:
                continue
            for name in st['names']:
                if not idmap.get(name):
                    raise KeyError(f'shape {name} not found or ambiguous')
                spid = idmap[name]
                key = (spid, st['eff'])
                grp = grpof(spid)
                effs += effect(c, st['eff'], spid, st['dur'], node, grp)
        inner += f'<p:par><p:cTn id="{inner_id}" fill="hold"><p:stCondLst><p:cond delay="{o}"/></p:stCondLst><p:childTnLst>{effs}</p:childTnLst></p:cTn></p:par>'
    cond = '<p:cond delay="indefinite"/>'
    if g['auto'] and first_auto:
        cond += '<p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond>'
    return f'<p:par><p:cTn id="{outer_id}" fill="hold"><p:stCondLst>{cond}</p:stCondLst><p:childTnLst>{inner}</p:childTnLst></p:cTn></p:par>'


def timing_xml(sl, idmap, picids):
    a = ANIM.get(str(sl))
    if not a or (not a['main'] and not a['trig']):
        return ''
    c = Ctr()
    used = {}

    def grpof(spid):
        used[spid] = used.get(spid, -1) + 1
        return used[spid]
    seqs = ''
    if a['main']:
        groups = build_groups(a['main'])
        # assign ids: tmRoot=1, mainSeq=2 -> counter starts at 2
        c.n = 2
        body = ''.join(group_xml(c, g, idmap, grpof, i == 0) for i, g in enumerate(groups))
        seqs += (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>{body}</p:childTnLst></p:cTn>'
                 '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
                 '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>')
    for t in a['trig']:
        tid = idmap[t['trigger']]
        seq_id = c()
        groups = build_groups(t['steps'])
        groups[0]['auto'] = False
        body = ''.join(group_xml(c, g, idmap, grpof, False) for g in groups)
        seqs += (f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{seq_id}" restart="whenNotActive" fill="hold" evtFilter="cancelBubble" nodeType="interactiveSeq">'
                 f'<p:stCondLst><p:cond evt="onClick" delay="0">{tgt(tid)}</p:cond></p:stCondLst>'
                 f'<p:endSync evt="end" delay="0"><p:rtn val="all"/></p:endSync><p:childTnLst>{body}</p:childTnLst></p:cTn>'
                 f'<p:nextCondLst><p:cond evt="onClick" delay="0">{tgt(tid)}</p:cond></p:nextCondLst></p:seq>')
    bld = ''.join(f'<p:bldP spid="{sp}" grpId="{g}" animBg="1"/>' for sp, n in used.items() if sp not in picids for g in range(n + 1))
    bld = f'<p:bldLst>{bld}</p:bldLst>' if bld else ''
    return (f'<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>{seqs}'
            f'</p:childTnLst></p:cTn></p:par></p:tnLst>{bld}</p:timing>')


def transition_xml(kind):
    if kind == 'morph':
        return ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
                '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" Requires="p159">'
                '<p:transition spd="slow" p14:dur="1250"><p159:morph option="byObject"/></p:transition></mc:Choice>'
                '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
    return '<p:transition spd="slow"><p:fade/></p:transition>'


tmp = dst + '.dir'
shutil.rmtree(tmp, ignore_errors=True)
zipfile.ZipFile(src).extractall(tmp)
n = len(ANIM)
for i in range(1, n + 1):
    p = f'{tmp}/ppt/slides/slide{i}.xml'
    x = open(p, encoding='utf-8').read()
    idmap = {}
    for sid, name in re.findall(r'<p:cNvPr id="(\d+)" name="([^"]*)"', x):
        name = name.replace('&amp;', '&')
        idmap[name] = None if name in idmap else sid
    picids = set(re.findall(r'<p:pic>\s*<p:nvPicPr>\s*<p:cNvPr id="(\d+)"', x))
    add = transition_xml(TRANS[str(i)]) + timing_xml(i, idmap, picids)
    if '<p:timing' in x or '<p:transition' in x:
        raise SystemExit('slide already has timing/transition')
    if '</p:clrMapOvr>' in x:
        x = x.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + add, 1)
    else:
        x = x.replace('</p:cSld>', '</p:cSld>' + add, 1)
    open(p, 'w', encoding='utf-8').write(x)

# de-duplicate identical media files
import hashlib, glob
seen, remap = {}, {}
for f in sorted(glob.glob(f'{tmp}/ppt/media/*')):
    h = hashlib.md5(open(f, 'rb').read()).hexdigest() + os.path.splitext(f)[1]
    if h in seen:
        remap[os.path.basename(f)] = seen[h]; os.remove(f)
    else:
        seen[h] = os.path.basename(f)
for r in glob.glob(f'{tmp}/ppt/**/_rels/*.rels', recursive=True):
    x = open(r, encoding='utf-8').read()
    y = re.sub(r'(Target="\.\./media/)([^"]+)"', lambda m: m.group(1) + remap.get(m.group(2), m.group(2)) + '"', x)
    if y != x:
        open(r, 'w', encoding='utf-8').write(y)
ct = open(f'{tmp}/[Content_Types].xml', encoding='utf-8').read()
for k in remap:
    ct = re.sub(r'<Override PartName="/ppt/media/' + re.escape(k) + r'"[^>]*/>', '', ct)
open(f'{tmp}/[Content_Types].xml', 'w', encoding='utf-8').write(ct)
print('removed duplicate media:', len(remap))

if os.path.exists(dst):
    os.remove(dst)
# repack: [Content_Types].xml first
with zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED) as z:
    z.write(f'{tmp}/[Content_Types].xml', '[Content_Types].xml')
    for root, _, files in os.walk(tmp):
        for f in files:
            full = os.path.join(root, f)
            arc = os.path.relpath(full, tmp)
            if arc != '[Content_Types].xml':
                z.write(full, arc)
shutil.rmtree(tmp)
print('animated', n, 'slides')
