using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class LevelEnd : MonoBehaviour {

	public float timer = 0;



	
	// Update is called once per frame
	void Update () {

		timer += Time.deltaTime;
		//Debug.Log (timer.ToString());
		
	}

	void OnTriggerEnter(Collider other) 
	{
		Debug.Log (timer.ToString());
		Scene activeScene = SceneManager.GetActiveScene ();
		PlayerPrefs.SetInt (activeScene.name, Mathf.RoundToInt( timer));
		int nextScene = activeScene.buildIndex + 1;
		SceneManager.LoadScene (nextScene);
	}
}
