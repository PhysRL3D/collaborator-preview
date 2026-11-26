/* Figure 10 / fig:simall, 2026-11-17 archived source. Angles are paper-reported, not rerun measurements.
   Fill simulation only after matching the original input/mesh/checkpoint and source timing.
   No remote media requests or invented filenames are used for missing clips. */
(function (root) {
  const cases = [
  {
    "id": "hydrant",
    "name": "Fire hydrant",
    "order": 1,
    "category": "object",
    "tags": [
      "消防栓",
      "hydrant"
    ],
    "tilt": {
      "base": 88,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/hydrant_base.jpg",
      "ours": "assets/figs/sim/appendix/hydrant_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Transferred source clips and sidecars matched; SHA256 agrees with d61; 96 frames / 24fps / 4s decoded locally. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {"fps":24,"mediaDurationS":4,"segments":[{"mediaStartS":0,"mediaEndS":3,"simStartS":0,"rate":1},{"mediaStartS":3,"mediaEndS":4,"simStartS":9.958333333333334,"rate":0}]},
      "base": {"src":"assets/pilot_hydrant/trellis2_color.mp4","poster":"assets/pilot_hydrant/trellis2_start.jpg","releaseOffsetS":0,"simSecondsPerMediaSecond":1,"sha256":"9df1ad767cc4411c488c54c3eaf669a6866c4c40b72fb44aecfeb941ddd38dd6"},
      "ours": {"src":"assets/pilot_hydrant/tds_color.mp4","poster":"assets/pilot_hydrant/sas_start.jpg","releaseOffsetS":0,"simSecondsPerMediaSecond":1,"sha256":"4d785a4bc79c5486c4241432ce0b2d0362815b34aadb1447557072749841aee8"}
    },
    "input": "assets/pilot_hydrant/input.png",
    "provenance": {"uid":"ffba9ea51d8e0b3a8bc14fd28c9b4f9cce801e952d4636a3d291290043c9022e","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop","jsonBase":"assets/pilot_hydrant/trellis2_color.json","jsonOurs":"assets/pilot_hydrant/tds_color.json"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "dog",
    "name": "Dog",
    "order": 2,
    "category": "animal",
    "tags": [
      "狗"
    ],
    "tilt": {
      "base": 121,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/dog_base.jpg",
      "ours": "assets/figs/sim/appendix/dog_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/dog/trellis2_color.mp4",
        "poster": "assets/simall/dog/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "e84e39ee740fbdd353c33abb12420d5e2c8695d7a471fa68ed80e0589245c05a"
      },
      "ours": {
        "src": "assets/simall/dog/tds_color.mp4",
        "poster": "assets/simall/dog/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "9d34baa5ab27d15d100df2e7dcaa4a18c3a61011962e7878e0eb9f8933827dfe"
      }
    },
    "input": "assets/simall/dog/input.png",
    "provenance": {"uid":"ffc5085355fddbc66e7c21364cdbdd4e","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "woman",
    "name": "Standing woman",
    "order": 3,
    "category": "character",
    "tags": [
      "女人",
      "人物"
    ],
    "tilt": {
      "base": 90,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/woman_base.jpg",
      "ours": "assets/figs/sim/appendix/woman_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/woman/trellis2_color.mp4",
        "poster": "assets/simall/woman/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "7c62cca4574f4d3ee1e5e13af923a688a3e5aec3792f785160360652a9cee0ac"
      },
      "ours": {
        "src": "assets/simall/woman/tds_color.mp4",
        "poster": "assets/simall/woman/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "6f139ed73f4ea6c0d71b3fe72d26e4110bff77d2303b676c6c0fa7b45f5a13dc"
      }
    },
    "input": "assets/simall/woman/input.png",
    "provenance": {"uid":"005402acdaf6c117166e8f52ff0cab20de9ed6c44a694216ef811c9c4eadfae3","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "femsword",
    "name": "Female figure with sword",
    "order": 4,
    "category": "character",
    "tags": [
      "剑",
      "女性"
    ],
    "tilt": {
      "base": 86,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/femsword_base.jpg",
      "ours": "assets/figs/sim/appendix/femsword_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/femsword/trellis2_color.mp4",
        "poster": "assets/simall/femsword/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "1a24dd926a105d7608883a8db347bcb909e7f70489994346499e7d0df8d14a4b"
      },
      "ours": {
        "src": "assets/simall/femsword/tds_color.mp4",
        "poster": "assets/simall/femsword/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "19e25bc0661eb0068f9b903c64338590ecc6c57aecf5e98c1098c19bd5156024"
      }
    },
    "input": "assets/simall/femsword/input.png",
    "provenance": {"uid":"00374c6a18091147ecd8b00d7bb02736abe5a63218bd128fd4db34bcae6186c7","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "staff",
    "name": "Warrior with staff",
    "order": 5,
    "category": "character",
    "tags": [
      "战士",
      "法杖"
    ],
    "tilt": {
      "base": 90,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/staff_base.jpg",
      "ours": "assets/figs/sim/appendix/staff_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/staff/trellis2_color.mp4",
        "poster": "assets/simall/staff/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "ca19248c19435c35360b55ad554d5cf730df3789d79de93d564aa7866b2f63a2"
      },
      "ours": {
        "src": "assets/simall/staff/tds_color.mp4",
        "poster": "assets/simall/staff/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "2fea34db231aea3cb0f4a4502e38dd1c5a136f663a631ddaf4ecf295f650b694"
      }
    },
    "input": "assets/simall/staff/input.png",
    "provenance": {"uid":"0009ed1fcad36ed6143c290d957604ccd58c416455ab1617654d71087f6a0c6d","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "lowpoly",
    "name": "Low-poly figure",
    "order": 6,
    "category": "character",
    "tags": [
      "低多边形",
      "人物"
    ],
    "tilt": {
      "base": 109,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/lowpoly_base.jpg",
      "ours": "assets/figs/sim/appendix/lowpoly_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/lowpoly/trellis2_color.mp4",
        "poster": "assets/simall/lowpoly/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "ffd0f46b5376ed90c8f0d36d6b6e39b3cd2f9b430d4b81a36f5f1562b842e313"
      },
      "ours": {
        "src": "assets/simall/lowpoly/tds_color.mp4",
        "poster": "assets/simall/lowpoly/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "dae20e5a20b4d4f2b8324ebd1959b0cae56c91f8992506600ca122d48f2fd66d"
      }
    },
    "input": "assets/simall/lowpoly/input.png",
    "provenance": {"uid":"ff8e86bf4c44f8fc6fedb96af6b974bd9a30d4a410ef0ed68aa1dbdaf0a84c90","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "humanoid",
    "name": "Humanoid robot",
    "order": 7,
    "category": "character",
    "tags": [
      "机器人"
    ],
    "tilt": {
      "base": 87,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/humanoid_base.jpg",
      "ours": "assets/figs/sim/appendix/humanoid_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/humanoid/trellis2_color.mp4",
        "poster": "assets/simall/humanoid/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "9bc47a6c7ad252f3d996c53f30102a1f58d39453b24cd110b4582bbd905bd079"
      },
      "ours": {
        "src": "assets/simall/humanoid/tds_color.mp4",
        "poster": "assets/simall/humanoid/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "d6eda92952e9daeee9f5d88af8a91bc415efd91f3dc1ebe9748fa4054fcf1964"
      }
    },
    "input": "assets/simall/humanoid/input.png",
    "provenance": {"uid":"ffc511a0429476260a75d91eaf200215","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "boxy",
    "name": "Boxy robot",
    "order": 8,
    "category": "character",
    "tags": [
      "机器人",
      "方形"
    ],
    "tilt": {
      "base": 104,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/boxy_base.jpg",
      "ours": "assets/figs/sim/appendix/boxy_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/boxy/trellis2_color.mp4",
        "poster": "assets/simall/boxy/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "9499c48d295138817c5cc383cfb7962e3647419da339f0c034b0c5187d2e6bad"
      },
      "ours": {
        "src": "assets/simall/boxy/tds_color.mp4",
        "poster": "assets/simall/boxy/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "38f93cf46bbde259ec7b58a11b339bc26f0a9a743948acc4b8912d252d51d555"
      }
    },
    "input": "assets/simall/boxy/input.png",
    "provenance": {"uid":"00509cc5c39d2a5bd6c25afd2f262a65","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "hair",
    "name": "Hair and head",
    "order": 9,
    "category": "character",
    "tags": [
      "头发",
      "头部"
    ],
    "tilt": {
      "base": 100,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/hair_base.jpg",
      "ours": "assets/figs/sim/appendix/hair_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/hair/trellis2_color.mp4",
        "poster": "assets/simall/hair/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "c39f9bd138a3e2e2feeaf7ff2065bc3456045ff644a11d3eed50a08d0e1f645f"
      },
      "ours": {
        "src": "assets/simall/hair/tds_color.mp4",
        "poster": "assets/simall/hair/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "80977b8a67a9265b751aecd35c2880212c0accb6306f5699affcb3761230eca6"
      }
    },
    "input": "assets/simall/hair/input.png",
    "provenance": {"uid":"ffe558740ffde0289d6a8b624709fb3bcb0fe1706596d9edd5675ac258eeabff","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "headbust",
    "name": "Head bust",
    "order": 10,
    "category": "character",
    "tags": [
      "半身像",
      "头部"
    ],
    "tilt": {
      "base": 18,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/headbust_base.jpg",
      "ours": "assets/figs/sim/appendix/headbust_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/headbust/trellis2_color.mp4",
        "poster": "assets/simall/headbust/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "cab01b4f18fba90807a92dcb2689e5409b33d52642b5d341bdefc5ea514da5ed"
      },
      "ours": {
        "src": "assets/simall/headbust/tds_color.mp4",
        "poster": "assets/simall/headbust/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "25839f83c5a8f9c7fa389193cc768abbc5d98846fb9150e908e1cf596a0a63d9"
      }
    },
    "input": "assets/simall/headbust/input.png",
    "provenance": {"uid":"ffb03fbce8c272840c1efb28e063265c","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "frog",
    "name": "Frog-like figure",
    "order": 11,
    "category": "animal",
    "tags": [
      "青蛙"
    ],
    "tilt": {
      "base": 92,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/frog_base.jpg",
      "ours": "assets/figs/sim/appendix/frog_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/frog/trellis2_color.mp4",
        "poster": "assets/simall/frog/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "85203c998b37ab5b8cc3bd094d82bc68f8a5be72268b4b5d945aad1117522e6c"
      },
      "ours": {
        "src": "assets/simall/frog/tds_color.mp4",
        "poster": "assets/simall/frog/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "92e0bfab9391f99c88d796df02f581a328d789aec51cd227de7892f825a1d8f8"
      }
    },
    "input": "assets/simall/frog/input.png",
    "provenance": {"uid":"ffee5e5bb11a07c16350284ef9cadacc2100fa8dc0cba3591f0550dddd5678ea","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "camel",
    "name": "Camel",
    "order": 12,
    "category": "animal",
    "tags": [
      "骆驼"
    ],
    "tilt": {
      "base": 81,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/camel_base.jpg",
      "ours": "assets/figs/sim/appendix/camel_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/camel/trellis2_color.mp4",
        "poster": "assets/simall/camel/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "75b085cdb5d2227e083887ccad41bc660b7c68c43b5433f2866626e9df6256d7"
      },
      "ours": {
        "src": "assets/simall/camel/tds_color.mp4",
        "poster": "assets/simall/camel/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "b260c3455456d1cb8358e713194400df5b7dd7acb8005c49d24e1ac5b4190e24"
      }
    },
    "input": "assets/simall/camel/input.png",
    "provenance": {"uid":"0082a592723f4681aee1df7e6ec31788","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "cat",
    "name": "Armoured cat",
    "order": 13,
    "category": "animal",
    "tags": [
      "猫"
    ],
    "tilt": {
      "base": 80,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/cat_base.jpg",
      "ours": "assets/figs/sim/appendix/cat_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/cat/trellis2_color.mp4",
        "poster": "assets/simall/cat/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "dee0de9f842840e5d7968669c04e4b8bd687db5b896bb59386c6e5c2b723f136"
      },
      "ours": {
        "src": "assets/simall/cat/tds_color.mp4",
        "poster": "assets/simall/cat/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "90db203f88f149d7a63354c880bfdff915236d67cebf551ead16d68fe6254d1d"
      }
    },
    "input": "assets/simall/cat/input.png",
    "provenance": {"uid":"ffcbb5684b3627f79561b5b1f15bd77c","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "skeleton",
    "name": "Quadruped skeleton",
    "order": 14,
    "category": "animal",
    "tags": [
      "骨架"
    ],
    "tilt": {
      "base": 87,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/skeleton_base.jpg",
      "ours": "assets/figs/sim/appendix/skeleton_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/skeleton/trellis2_color.mp4",
        "poster": "assets/simall/skeleton/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "63b0fac748d05b2cee10c65eb13001d48eda660681e63d3253941b28f84a34a0"
      },
      "ours": {
        "src": "assets/simall/skeleton/tds_color.mp4",
        "poster": "assets/simall/skeleton/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "c058544296b1764dc0b4e3898abc2c2342a65a2a8ba411294964ab5e52dc7da3"
      }
    },
    "input": "assets/simall/skeleton/input.png",
    "provenance": {"uid":"ff519d0dc1f1d986a52be14dfa4c964b8516a5f4d46d8916a441fa77cb73e169","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "spider",
    "name": "Spider",
    "order": 15,
    "category": "animal",
    "tags": [
      "蜘蛛"
    ],
    "tilt": {
      "base": 56,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/spider_base.jpg",
      "ours": "assets/figs/sim/appendix/spider_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/spider/trellis2_color.mp4",
        "poster": "assets/simall/spider/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "eb4594cee10c0cbc48d3dad5fe50651dfe51b2d4fc081add09bc962ab3dcb816"
      },
      "ours": {
        "src": "assets/simall/spider/tds_color.mp4",
        "poster": "assets/simall/spider/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "40d595d9ca515a7e201c877fefab2ce969f41c2364968798aa2ab5edde9f96d8"
      }
    },
    "input": "assets/simall/spider/input.png",
    "provenance": {"uid":"002122c2db5a48b383598fec645cb459","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "cypress",
    "name": "Cypress tree",
    "order": 16,
    "category": "vegetation",
    "tags": [
      "柏树",
      "树"
    ],
    "tilt": {
      "base": 86,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/cypress_base.jpg",
      "ours": "assets/figs/sim/appendix/cypress_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/cypress/trellis2_color.mp4",
        "poster": "assets/simall/cypress/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "09bff27c4f2a7d61c66944eaeb616d1957490c3218adf94c17148f4c7938238a"
      },
      "ours": {
        "src": "assets/simall/cypress/tds_color.mp4",
        "poster": "assets/simall/cypress/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "b9b6d5ec24200cbc9144f1860c6a4d7940ba3ac37b204ba527558c66bb33e1f5"
      }
    },
    "input": "assets/simall/cypress/input.png",
    "provenance": {"uid":"ff93c093c4e620c3ecf5e3d197d8f7417b6d63ef0a892a8ba952bb1cf86676e5","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "baretree",
    "name": "Bare tree",
    "order": 17,
    "category": "vegetation",
    "tags": [
      "枯树",
      "树"
    ],
    "tilt": {
      "base": 84,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/baretree_base.jpg",
      "ours": "assets/figs/sim/appendix/baretree_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/baretree/trellis2_color.mp4",
        "poster": "assets/simall/baretree/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "6c3da02f4407d65d6816f3f0ed30652a6ce62edce663ac1a39ca07a88ecdb4d5"
      },
      "ours": {
        "src": "assets/simall/baretree/tds_color.mp4",
        "poster": "assets/simall/baretree/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "4e4f0bb56a9114ee145a3f68d474b65dbb3aca07e953a61d17c223e4dc0670c4"
      }
    },
    "input": "assets/simall/baretree/input.png",
    "provenance": {"uid":"ffce38329506148dca0cc3c7338078383ceb102dfa99c7ffc8a982b7f70def74","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "monitor",
    "name": "Computer monitor",
    "order": 18,
    "category": "object",
    "tags": [
      "显示器",
      "电脑"
    ],
    "tilt": {
      "base": 92,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/monitor_base.jpg",
      "ours": "assets/figs/sim/appendix/monitor_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/monitor/trellis2_color.mp4",
        "poster": "assets/simall/monitor/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "dcb128dac80d06b642cf2874f7a0e04eafd16a6910fd5d78a0e46537e3ce17df"
      },
      "ours": {
        "src": "assets/simall/monitor/tds_color.mp4",
        "poster": "assets/simall/monitor/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "044de6b23f29175f48b3eb3fc916fef0363e250b0a3e70b60ec6ee82275923d4"
      }
    },
    "input": "assets/simall/monitor/input.png",
    "provenance": {"uid":"ffbbf4494207b15ba25d31709adc0e3caf70741310b368b9f4dac05a4521c2a3","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "belljar",
    "name": "Bell-jar machine",
    "order": 19,
    "category": "object",
    "tags": [
      "机器",
      "钟罩"
    ],
    "tilt": {
      "base": 94,
      "ours": 0
    },
    "stills": {
      "base": "assets/figs/sim/appendix/belljar_base.jpg",
      "ours": "assets/figs/sim/appendix/belljar_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/belljar/trellis2_color.mp4",
        "poster": "assets/simall/belljar/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "c31f7960b766fa1b3cdf075be373ce553a63068840395a36478575a741ff60c1"
      },
      "ours": {
        "src": "assets/simall/belljar/tds_color.mp4",
        "poster": "assets/simall/belljar/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "e136df261004e1629dc1c63280c5960487f79b90686d943fe2286a30cdb89422"
      }
    },
    "input": "assets/simall/belljar/input.png",
    "provenance": {"uid":"0010243e40244bb6a157417df028fd43","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  },
  {
    "id": "scifi",
    "name": "Sci-fi vehicle",
    "order": 20,
    "category": "object",
    "tags": [
      "科幻",
      "车辆"
    ],
    "tilt": {
      "base": 121,
      "ours": 11
    },
    "stills": {
      "base": "assets/figs/sim/appendix/scifi_base.jpg",
      "ours": "assets/figs/sim/appendix/scifi_sas.jpg"
    },
    "simulation": {
      "verified": true,
      "verificationScope": "Original 2026-11-11 colour renders copied byte-for-byte from the cluster (SHA256 checked); final tilt matches the paper figure; 96 frames / 24 fps / 4 s. Not a new physics rerun.",
      "durationS": 9.958333333333334,
      "timeline": {
        "fps": 24,
        "mediaDurationS": 4,
        "segments": [
          {
            "mediaStartS": 0,
            "mediaEndS": 3,
            "simStartS": 0,
            "rate": 1
          },
          {
            "mediaStartS": 3,
            "mediaEndS": 4,
            "simStartS": 9.958333333333334,
            "rate": 0
          }
        ]
      },
      "base": {
        "src": "assets/simall/scifi/trellis2_color.mp4",
        "poster": "assets/simall/scifi/trellis2_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "7308fb0aa4113123801907e06778fa29057ad50ffe23250e2752fd5a8fba045a"
      },
      "ours": {
        "src": "assets/simall/scifi/tds_color.mp4",
        "poster": "assets/simall/scifi/sas_start.jpg",
        "releaseOffsetS": 0,
        "simSecondsPerMediaSecond": 1,
        "sha256": "966d5a421a410ca8abe1dbd0f7c2e898d265f128fd2fc5484110241d9413f8ed"
      }
    },
    "input": "assets/simall/scifi/input.png",
    "provenance": {"uid":"fff3f6640e644f91ba084184307dd81f","baseTag":"base_g2","sasTag":"tdsd_s43_sd_e80","initialCondition":"resting on the floor; no drop"},
    "turntable": null,
    "realPrint": null
  }
];
  if (typeof module === 'object' && module.exports) module.exports = cases;
  else root.PHYSRL3D_CASES = cases;
})(typeof window !== 'undefined' ? window : globalThis);
