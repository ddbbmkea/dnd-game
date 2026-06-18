export const START_EVENT_ID = 'harbor-arrival'
export const DEFAULT_DC = 12

const S = { hp: 0, gold: 0, reputation: 0 }

/** @type {Record<string, { id: string, faction?: 'harper' | 'zhentarim' | 'neutral', text: string, choices: object[] }>} */
export const EVENTS = {
  'harbor-arrival': {
    id: 'harbor-arrival',
    faction: 'neutral',
    text: '워터딥 항구에 당도했다. 안개 속에서 하퍼의 하프 문양과 젠타림 길드의 날개 달린 뱀 문양이 동시에 눈에 들어온다.',
    choices: [
      {
        id: 'follow-harper',
        label: '하퍼 표식을 따라간다',
        nextEventId: 'harper-sign',
        result: '벽의 하프 문양이 좁은 골목으로 이어진다.',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'follow-zhentarim',
        label: '젠타림 문양을 조사한다',
        nextEventId: 'zhentarim-rumor',
        result: '뱀 문양 근처에서 속삭임이 들린다. "보스가 새 침입자를 주목하고 있어."',
        stats: S,
      },
      {
        id: 'go-tavern',
        label: '야닝 포털로 향한다',
        nextEventId: 'yawning-portal',
        result: '여관 문간에서 주방의 연기와 손님들의 수군거림이 섞여 흘러나온다.',
        stats: S,
      },
    ],
  },

  'harper-sign': {
    id: 'harper-sign',
    faction: 'harper',
    text: '골목 끝 벽돌에 하퍼 암호가 새겨져 있다. "밤이 깊을수록 진실은 가까워진다."',
    choices: [
      {
        id: 'answer-code',
        label: '암호에 응답한다',
        nextEventId: 'harper-contact',
        result: '벽 너머에서 "친구인가?"라는 속삭임이 들린다.',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'watch-alley',
        label: '골목을 감시한다',
        nextEventId: 'dock-alley',
        result: '젠타림 문신을 한 자들이 밀수품을 옮기는 것을 목격한다.',
        stats: S,
      },
      {
        id: 'leave-sign',
        label: '표식을 무시한다',
        nextEventId: 'yawning-portal',
        result: '하퍼의 표식 뒤로, 당신은 다시 번화한 거리로 돌아선다.',
        stats: { ...S, reputation: -1 },
      },
    ],
  },

  'harper-contact': {
    id: 'harper-contact',
    faction: 'harper',
    text: '하퍼 요원 레나가 나타난다. "젠타림 길드가 항구 밀수 루트를 장악했어. 우리 편이 될래?"',
    choices: [
      {
        id: 'accept-mission',
        label: '하퍼 임무를 수락한다',
        nextEventId: 'harper-safehouse',
        result: '레나가 은신처 열쇠를 건넨다. "트라이럼 상층, 세 번째 문."',
        stats: { ...S, reputation: 2 },
      },
      {
        id: 'ask-sewer',
        label: '하수구 정보를 요청한다',
        nextEventId: 'sewer-undercity',
        result: '레나가 지하 통로 지도를 슬쩍 보여준다. "젠타림도 같은 길을 쓰지."',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'refuse-harper',
        label: '하퍼를 거절한다',
        nextEventId: 'zhentarim-recruiter',
        result: '레나는 고개를 돌린다. "그럼 다른 세력이 너를 찾을 거야."',
        stats: { ...S, reputation: -1 },
      },
    ],
  },

  'harper-safehouse': {
    id: 'harper-safehouse',
    faction: 'harper',
    text: '하퍼 은신처. 벽에는 젠타림 길드 창고 구조도와 "X" 표시가 붙어 있다.',
    choices: [
      {
        id: 'plan-heist',
        label: '젠타림 창고 습격을 계획한다',
        nextEventId: 'zhentarim-warehouse',
        result: '하퍼들은 밤 열 시를 공격 시각으로 정한다.',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'spy-infiltrate',
        label: '첩자로 잠입한다',
        requiresRoll: true,
        dc: 13,
        outcomes: {
          criticalSuccess: {
            nextEventId: 'zhentarim-warehouse',
            result: '완벽한 위장이다. 젠타림 간부가 당신을 내부 인원으로 착각한다.',
            stats: { ...S, gold: 5, reputation: 2 },
          },
        
          success: {
            nextEventId: 'zhentarim-warehouse',
            result: '젠타림 문신을 위조해 길드원처럼 행동한다. 아무도 의심하지 않는다.',
            stats: { ...S, gold: 1 },
          },
        
          failure: {
            nextEventId: 'zhentarim-trap',
            result: '위조가 들통난다. 어둠 속에서 발소리가 몰려온다.',
            stats: { ...S, hp: -1 },
          },
        
          criticalFailure: {
            nextEventId: 'zhentarim-trap',
            result: '위조 문신이 엉망이다. 젠타림 간부가 직접 나타나 당신을 체포한다.',
            stats: { ...S, hp: -3, gold: -2 },
          },
        },
      },
      {
        id: 'rest-harper',
        label: '은신처에서 휴식한다',
        nextEventId: 'final-crossroads',
        result: '하퍼의 치유 물약으로 기력을 회복한다. 다음 선택이 도시의 운명을 가른다.',
        stats: { ...S, hp: 2, reputation: 1 },
      },
    ],
  },

  'zhentarim-rumor': {
    id: 'zhentarim-rumor',
    faction: 'zhentarim',
    text: '항구 주점에서 젠타림 길드가 밀수품 "뱀의 상자"를 찾고 있다는 소문이 돈다.',
    choices: [
      {
        id: 'offer-help',
        label: '길드에 협력하겠다고 한다',
        nextEventId: 'zhentarim-recruiter',
        result: '주점 구석의 자가 고개를 끄덕인다. "따라와."',
        stats: { ...S, reputation: -1 },
      },
      {
        id: 'report-harper',
        label: '하퍼에 제보한다',
        nextEventId: 'harper-contact',
        result: '당신의 정보로 하퍼가 급히 움직인다. 레나가 고개를 끄덕인다.',
        stats: { ...S, reputation: 2 },
      },
      {
        id: 'tail-smuggler',
        label: '밀수꾼을 미행한다',
        requiresRoll: true,
        dc: 12,
        outcomes: {
          success: {
            nextEventId: 'zhentarim-warehouse',
            result: '밀수꾼은 젠타림 창고 아래 통로로 사라진다. 당신은 길을 기억한다.',
            stats: { ...S, gold: 2 },
          },
          failure: {
            nextEventId: 'zhentarim-trap',
            result: '발각당했다. "보스에게 데려가."',
            stats: { ...S, hp: -1, gold: -1 },
          },
          criticalSuccess: {
            nextEventId: 'zhentarim-warehouse',
            result: '밀수꾼의 비밀 거래 현장까지 발견했다.',
            stats: { ...S, gold: 5, reputation: 1 },
          },
          
          criticalFailure: {
            nextEventId: 'zhentarim-trap',
            result: '미행하다 발을 헛디뎌 바다에 빠졌다. 젠타림에게 끌려간다.',
            stats: { ...S, hp: -3, gold: -2 },
          },
        },
      },
    ],
  },

  'zhentarim-recruiter': {
    id: 'zhentarim-recruiter',
    faction: 'zhentarim',
    text: '젠타림 모집꾼 노그가 나타난다. "워터딥에서 살려면 편을 골라야 해. 우리 보스는 관대하지."',
    choices: [
      {
        id: 'join-guild',
        label: '젠타림 길드에 가입한다',
        nextEventId: 'zhentarim-warehouse',
        result: '뱀 문양 문신을 임시로 그려준다. "이제 너도 뱀 아래에 있다."',
        stats: { ...S, gold: 3, reputation: -2 },
      },
      {
        id: 'double-agent',
        label: '겉으로만 따른다',
        nextEventId: 'harper-safehouse',
        result: '당신은 길드 정보를 하퍼에게 넘기기로 결심한다.',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'refuse-guild',
        label: '거절하고 도망친다',
        nextEventId: 'dock-alley',
        result: '노그의 손아귀를 빠져나와 어두운 부두 골목으로 뛰어든다.',
        stats: { ...S, hp: -1 },
      },
    ],
  },

  'zhentarim-warehouse': {
    id: 'zhentarim-warehouse',
    faction: 'zhentarim',
    text: '젠타림 길드 창고. 상자들에는 날개 달린 뱀 인장이 박혀 있고, 하퍼의 감시 표식도 희미하게 보인다.',
    choices: [
      {
        id: 'steal-box',
        label: '뱀의 상자를 훔친다',
        requiresRoll: true,
        dc: 14,
        outcomes: {
          success: {
            nextEventId: 'final-crossroads',
            result: '상자를 확보했다. 하퍼와 젠타림 모두 이 물건을 원한다.',
            stats: { ...S, gold: 5 },
          },
          failure: {
            nextEventId: 'zhentarim-trap',
            result: '경보 마법이 울린다. 발소리가 사방에서 들려온다.',
            stats: { ...S, hp: -2 },
          },
          criticalSuccess: {
            nextEventId: 'final-crossroads',
            result: '상자뿐 아니라 숨겨진 금고까지 발견했다.',
            stats: { ...S, gold: 10, reputation: 2 },
          },
          
          criticalFailure: {
            nextEventId: 'zhentarim-trap',
            result: '경보 마법과 함정이 동시에 발동했다.',
            stats: { ...S, hp: -4, gold: -2 },
          },
        },
      },
      {
        id: 'swap-info',
        label: '하퍼에 위치를 전달한다',
        nextEventId: 'harper-safehouse',
        result: '레나에게 창고 구조를 넘긴다. "때가 됐어."',
        stats: { ...S, reputation: 2 },
      },
      {
        id: 'descend-sewer',
        label: '창고 아래 통로로 내려간다',
        nextEventId: 'sewer-undercity',
        result: '젠타림 밀수로가 하수구와 연결되어 있다.',
        stats: S,
      },
    ],
  },

  'zhentarim-trap': {
    id: 'zhentarim-trap',
    faction: 'zhentarim',
    text: '젠타림 함정에 빠졌다. 벽에는 거대한 뱀 문양이 빛나고, "젠타림은 모든 것을 본다"는 속삭임이 울린다.',
    choices: [
      {
        id: 'fight-out',
        label: '뚫고 나간다',
        requiresRoll: true,
        dc: 15,
        outcomes: {
          success: {
            nextEventId: 'dock-alley',
            result: '함정을 부수고 부두 골목으로 탈출한다. 온몸은 상처투성이지만 자유다.',
            stats: { ...S, hp: -2, reputation: 1 },
          },
          failure: {
            nextEventId: 'final-crossroads',
            result: '제압당했다. 길드는 당신을 협상 카드로 쥐게 된다.',
            stats: { ...S, hp: -3, gold: -3, reputation: -2 },
          },
          criticalSuccess: {
            nextEventId: 'dock-alley',
            result: '적들을 압도하며 탈출했다. 소문이 도시 전체에 퍼진다.',
            stats: { ...S, reputation: 3 },
          },
          
          criticalFailure: {
            nextEventId: 'final-crossroads',
            result: '압도적으로 패배했다. 거의 죽기 직전 상태로 끌려간다.',
            stats: { ...S, hp: -5, gold: -5, reputation: -3 },
          },
        },
      },
      {
        id: 'call-harper',
        label: '하퍼 신호를 보낸다',
        nextEventId: 'harper-safehouse',
        result: '하퍼 구조대가 개입해 당신을 빼낸다. "빚은 나중에 갚아."',
        stats: { ...S, hp: -1, reputation: 2 },
      },
      {
        id: 'swear-loyalty',
        label: '젠타림에 충성을 맹세한다',
        nextEventId: 'zhentarim-recruiter',
        result: '노그가 비웃으며 풀어준다. "현명한 선택이야."',
        stats: { ...S, gold: 2, reputation: -3 },
      },
    ],
  },

  'yawning-portal': {
    id: 'yawning-portal',
    faction: 'neutral',
    text: '야닝 포털. 모험가들은 하퍼와 젠타림 얘기를 속삭이며 술을 기울인다.',
    choices: [
      {
        id: 'listen-rumors',
        label: '소문을 듣는다',
        nextEventId: 'zhentarim-rumor',
        result: '바텐더가 젠타림의 "뱀의 상자" 이야기를 흘린다.',
        stats: S,
      },
      {
        id: 'meet-harper',
        label: '코트에 하프 핀을 단 자에게 접근한다',
        nextEventId: 'harper-contact',
        result: '그는 하퍼 정보원이다. "레나가 너를 기다리고 있어."',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'drink-alone',
        label: '혼자 술을 마신다',
        nextEventId: 'dock-alley',
        result: '술기운에 밤 부두 산책길로 나선다.',
        stats: { ...S, hp: 1 },
      },
    ],
  },

  'sewer-undercity': {
    id: 'sewer-undercity',
    faction: 'neutral',
    text: '워터딥 하수구. 벽에는 하퍼 화살표와 젠타림 뱀 표식이 겹쳐 새겨져 있다.',
    choices: [
      {
        id: 'harper-route',
        label: '하퍼 화살표를 따른다',
        nextEventId: 'harper-safehouse',
        result: '은신처로 통하는 비밀 사다리를 발견한다.',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'zhentarim-route',
        label: '젠타림 표식을 따른다',
        nextEventId: 'zhentarim-warehouse',
        result: '밀수품 창고 아래로 이어지는 문이 있다.',
        stats: { ...S, gold: 1 },
      },
      {
        id: 'explore-deep',
        label: '더 깊은 곳을 탐험한다',
        requiresRoll: true,
        dc: 12,
        outcomes: {
          success: {
            nextEventId: 'final-crossroads',
            result: '언더마운틴 입구 흔적을 발견한다. 도시 아래 더 큰 음모가 숨어 있다.',
            stats: { ...S, reputation: 2 },
          },
          failure: {
            nextEventId: 'zhentarim-trap',
            result: '길을 잃고 젠타림 순찰대와 마주친다.',
            stats: { ...S, hp: -1 },
          },
          criticalSuccess: {
            nextEventId: 'final-crossroads',
            result: '언더마운틴의 비밀 보물 창고를 발견했다.',
            stats: { ...S, gold: 8, reputation: 2 },
          },
          
          criticalFailure: {
            nextEventId: 'zhentarim-trap',
            result: '괴물 둥지에 떨어졌다가 젠타림 순찰대에게 발견된다.',
            stats: { ...S, hp: -4 },
          },
        },
      },
    ],
  },

  'dock-alley': {
    id: 'dock-alley',
    faction: 'neutral',
    text: '부두 골목. 하퍼 감시조와 젠타림 청부업자가 같은 골목 양편에서 서로를 주시한다.',
    choices: [
      {
        id: 'side-harper',
        label: '하퍼 편에 선다',
        nextEventId: 'harper-contact',
        result: '하퍼 감시조가 당신을 끌어들인다. "때가 됐군."',
        stats: { ...S, reputation: 1 },
      },
      {
        id: 'side-zhentarim',
        label: '젠타림 청부업자와 거래한다',
        nextEventId: 'zhentarim-recruiter',
        result: '"일 하나 하면 길드가 널 봐주지."',
        stats: { ...S, gold: 2, reputation: -1 },
      },
      {
        id: 'stay-neutral',
        label: '중립을 유지하며 빠져나간다',
        nextEventId: 'neutral-ending',
        result: '양쪽 세력 사이를 비집고 나온다. 아무도 완전히 신뢰하지 않는다.',
        stats: S,
      },
    ],
  },

  'neutral-ending': {
  id: 'neutral-ending',
  faction: 'neutral',
  text: '당신은 자신만의 길을 선택했다. 하퍼와 젠타림의 다툼은 계속되겠지만, 이제 그것은 당신의 이야기가 아니다.',

  choices: [
    {
      id: 'start-again',
      label: '새로운 모험을 시작한다',
      nextEventId: 'harbor-arrival',
      result: '새로운 의뢰가 당신을 기다린다.',
      stats: S,
    },
  ],
},

  'final-crossroads': {
    id: 'final-crossroads',
    faction: 'neutral',
    text: '워터딥의 운명이 걸린 순간. 하퍼와 젠타림의 그림자가 동시에 당신을 향한다. 마지막 선택의 때다.',
    choices: [
      {
        id: 'deliver-harper',
        label: '뱀의 상자를 하퍼에 넘긴다',
        nextEventId: 'harbor-arrival',
        result: '레나가 고개를 숙인다. "워터딥은 오늘 밤 너에게 빚졌어." 새로운 모험이 시작된다.',
        stats: { ...S, reputation: 3, gold: -1 },
      },
      {
        id: 'deliver-zhentarim',
        label: '젠타림 길드에 상자를 바친다',
        nextEventId: 'harbor-arrival',
        result: '노그가 웃는다. "보스가 기억할 거야." 안개 속 항구로 다시 발이 닿는다.',
        stats: { ...S, gold: 4, reputation: -2 },
      },
      {
        id: 'keep-box',
        label: '상자를 숨기고 도시를 떠난다',
        nextEventId: 'open-box-event',
        result: '양쪽 세력의 추적을 뿌리치고, 새벽 안개 속 다른 항구로 향한다.',
        stats: { ...S, hp: -1, gold: 2 },
      },
    ],
  },
  'cursed-ending': {
    id: 'cursed-ending',
    faction: 'neutral',

    text: '상자에 봉인되어 있던 고대의 저주가 풀려났다. 당신의 이름은 워터딥의 비극으로 기록된다.',

    choices: [
      {
        id: 'start-again',
        label: '새로운 모험을 시작한다',
        nextEventId: 'harbor-arrival',
        result: '시간은 다시 흐르기 시작한다.',
        stats: S,
      },
    ],
  },
  'open-box-event': {
    id: 'open-box-event',
    faction: 'neutral',

    text: '워터딥을 떠난 지 며칠이 지났다. 낡은 여관방에 홀로 앉아 있던 당신의 시선이 침대 밑에 숨겨 둔 뱀의 상자로 향한다. 하퍼와 젠타림이 그토록 원했던 물건. 지금껏 열어보지 않은 것이 오히려 이상할 정도다.',

    choices: [
      {
        id: 'open-box',
        label: '상자를 연다',
        requiresRoll: true,
        dc: 15,

        outcomes: {
          criticalSuccess: {
            nextEventId: 'neutral-ending',
            result: '상자 안에는 잊혀진 마법 유물과 금화가 가득했다. 당신은 누구에게도 휘둘리지 않는 부유한 모험가가 된다.',
            stats: { ...S, gold: 15, reputation: 2 },
          },

          success: {
            nextEventId: 'neutral-ending',
            result: '상자 속에는 워터딥의 오래된 비밀과 지도들이 들어 있었다. 당신은 그 지식을 품고 새로운 모험을 찾아 떠난다.',
            stats: { ...S, gold: 5, reputation: 1 },
          },

          failure: {
            nextEventId: 'injured-ending',
            result: '상자에 걸린 마법 함정이 발동했다. 큰 부상을 입었지만 간신히 살아남았다.',
            stats: S,
          },

          criticalFailure: {
            nextEventId: 'cursed-ending',
            result: '문이 열리는 순간 끔찍한 소리와 함께 검은 안개가 방 안을 뒤덮는다.',
            stats: S,
          },
        },
      },

      {
        id: 'sell-box',
        label: '상자를 팔아버린다',
        nextEventId: 'neutral-ending',
        result: '정체를 알 수 없는 수집가에게 상자를 넘겼다. 적당한 돈은 벌었지만 진실은 영영 알 수 없게 되었다.',
        stats: { ...S, gold: 8 },
      },

      {
        id: 'throw-box',
        label: '상자를 버린다',
        nextEventId: 'neutral-ending',
        result: '당신은 상자를 깊은 바다에 던져 버렸다. 비밀도 욕망도 파도 아래로 가라앉는다.',
        stats: { ...S, reputation: 1 },
      },
    ],
  },
  'injured-ending': {
    id: 'injured-ending',
    faction: 'neutral',

    text: '상자가 열리는 순간 강렬한 섬광이 터져 나왔다. 정신을 차렸을 때 여관방은 엉망이 되어 있었고, 몸 곳곳에 화상과 상처가 남아 있었다. 다행히 목숨은 건졌지만 상자 안의 비밀은 흔적도 없이 사라져 버렸다.',

    choices: [
      {
        id: 'start-again',
        label: '새로운 모험을 시작한다',
        nextEventId: 'harbor-arrival',
        result: '상처는 남았지만 모험가는 다시 길을 나선다.',
        stats: S,
      },
    ],
  },
}

export const EVENT_LIST = Object.values(EVENTS)
