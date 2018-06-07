public enum RotationAxes { MouseXAndY = 0, MouseX = 1, MouseY = 2 }
var axes = RotationAxes.MouseXAndY;
var sensitivityX : float = 15F;
var sensitivityY : float = 15F;

var minimumX : float = -360F;
var maximumX : float = 360F;

var rotationX : float = 0F;

var minimumY : float = -60F;
var maximumY : float = 60F;

var rotationY : float = 0F;

function Start ()
{
	if(GetComponent.<Rigidbody>())
	{
		GetComponent.<Rigidbody>().freezeRotation = true;
	}
}

function Update()
{
	if(Time.timeScale != 0)
	{
		if(axes == RotationAxes.MouseXAndY)
		{
			rotationX += Input.GetAxis("Mouse X") * sensitivityX;
			rotationX = Mathf.Clamp(rotationX, minimumX, maximumX);
			
			rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
			rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);
			
			transform.localEulerAngles = new Vector3(-rotationY, rotationX, 0);
		}
		else if(axes == RotationAxes.MouseX)
		{
			transform.Rotate(0, Input.GetAxis("Mouse X") * sensitivityX, 0);
		}
		else
		{
			rotationY += Input.GetAxis("Mouse Y") * sensitivityY;
			rotationY = Mathf.Clamp (rotationY, minimumY, maximumY);
			
			transform.localEulerAngles = new Vector3(-rotationY, transform.localEulerAngles.y, 0);
		}
	}
}