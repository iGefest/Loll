using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class ScoreManager : MonoBehaviour {
	public Text[] scores;
	// Use this for initialization
	void Start () {
		for (int i = 0; i < scores.Length; i++) {
			scores [i].text = PlayerPrefs.GetInt ("Level " + (i + 1), 0).ToString();
		}
	}
	
	// Update is called once per frame
	void Update () {
		
	}
}
